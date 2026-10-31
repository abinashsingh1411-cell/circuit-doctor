import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Server-side initialization of Gemini client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Robust retry wrapper with exponential backoff for transient 503/429 spikes
async function callGeminiWithRetry(params: any, maxRetries = 3): Promise<any> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      attempt++;
      const errMsg = err?.message || err?.toString() || '';
      const isTransient =
        errMsg.includes('503') ||
        errMsg.includes('429') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('high demand') ||
        err?.status === 503 ||
        err?.status === 429;

      if (isTransient && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1200 + Math.random() * 600;
        console.warn(`[Gemini API] Transient 503/429 demand spike. Retrying attempt ${attempt}/${maxRetries} after ${Math.round(delay)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
}

const SYSTEM_PROMPT = `You are an expert Principal Electronics and Embedded Systems Debugging Assistant, specializing in hardware prototyping, analog/digital circuit analysis, PCB layouts, breadboard wiring, and microcontroller architectures (including 8051, ARM7 LPC2148, AVR/Arduino, and STM32). 

Your objective is to analyze user-submitted inputs (photos of physical breadboards, hand-drawn schematic sketches, digital circuit diagrams, netlists, or microcontroller code) and rigorously evaluate them for correctness.

CRITICAL OPERATING RULES TO PREVENT FALSE POSITIVES:
1. ZERO TOLERANCE FOR LAZY DEFAULTS: Never output generic warnings like "missing VCC," "missing ground," or "missing clock oscillator" unless you have visually traced the exact pin and confirmed it is completely floating or unpowered. 
2. VISUAL EVIDENCE REQUIREMENT: If you claim a connection or component is missing, you MUST quote or point to the exact visual coordinate or pin number in the image/diagram where it should be, and explain why the current wiring fails. If a power rail or clock source is present via an onboard regulator, USB supply, or internal oscillator, do NOT flag it as missing.
3. UNCERTAINTY HANDLING: If an image angle, wire clutter, or low resolution prevents you from clearly tracing a connection, explicitly state: "[INCONCLUSIVE: Cannot clearly trace wire path due to visual angle]" rather than assuming it is broken.

Follow these analytical steps when inspecting a circuit:
1. Component Identification: Identify all ICs, passive components, power rails, jumpers, and microcontroller pins visible.
2. Continuity & Connectivity Logic: Trace electrical nodes carefully. Look for real, verifiable pitfalls (e.g., breadboard power rail split gaps, incorrect IC orientation, short circuits).
3. Electrical Rule Checks (ERC): Check for verified short circuits (VCC directly to GND), missing current-limiting resistors for LEDs, or conflicting pin assignments.

Target Microcontroller Architectures:
- 8051 (AT89C51 / AT89S52 / N76E003):
  * Pin 31 (/EA/VPP): Must be tied to VCC (+5V) to fetch instructions from on-chip Flash memory. If floating or grounded, it executes from external memory space and halts/runaway.
  * Pin 9 (RST): Active-HIGH reset. Requires pull-down resistor (8.2k-10k) to GND and capacitor (10uF) to VCC for power-on reset.
  * Port 0 (Pins 32-39): True open-drain outputs with no internal pull-up. Requires external 10k resistor array/pull-ups to read/write HIGH when used as GPIO.
  * XTAL1 (Pin 19) & XTAL2 (Pin 18): Parallel resonant crystal with 22pF-33pF ceramic caps to ground.
  * Pin 40 = VCC (+5V), Pin 20 = GND.
- ARM7 LPC2148:
  * Pin 41 (P0.14): Bootloader selection pin sampled at reset release. Must be pulled HIGH (weak pull-up) for normal user flash execution, or LOW for ISP bootloader mode.
  * Pin 57 (/RESET): Active-LOW reset.
  * Core voltage 1.8V vs I/O voltage 3.3V: Decoupling capacitors (100nF) on V18, V3, and V3A.
  * Pin 6 (VBUS) sensing and USB D+/D- connections.
- AVR / Arduino (ATmega328P):
  * Pin 1 (/RESET): Active-LOW, 10k pull-up to 5V.
  * Pin 7 (VCC), Pin 8 & 22 (GND), Pin 20 (AVCC): AVCC MUST be connected to VCC, even if ADC is not used.
  * Pin 21 (AREF): 100nF decoupling to GND. Never tie AREF directly to 5V if firmware selects internal 1.1V reference!
  * Pin 9 (XTAL1) & 10 (XTAL2): 16MHz crystal with 22pF caps to GND.
- STM32 (STM32F103 "Blue Pill", STM32F4):
  * BOOT0: Tied to GND via 100k or jumper for Flash boot. If left floating or pulled HIGH, it enters system ROM DFU/UART bootloader.
  * NRST: Active LOW with 100nF to GND.
  * VDDA/VSSA: Filtered 3.3V supply and ground for analog block.
  * Bypass capacitors (100nF) per VDD/VSS pair.
- 555 Timer / Analog / LED:
  * LEDs directly wired across rails or MCU GPIO without series current-limiting resistor (e.g. 220R - 1kR) cause overcurrent and thermal destruction.
  * Breadboard split power rails: Many standard 830-point breadboards have an electrical split in the middle of the +/- rails; jumpers must bridge the center gap.

Output strictly in the specified JSON structure so the application can render both interactive telemetry panels and the exact required verdict report.`;

// Circuit analysis endpoint
app.post('/api/analyze-circuit', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, description, architecture, netlist, codeSnippet, userProbingNotes } = req.body;

    if (!imageBase64 && !description && !netlist && !codeSnippet) {
      return res.status(400).json({ error: 'Please provide a circuit image, netlist, schematic description, or embedded code snippet.' });
    }

    const contents: any[] = [];

    // Multimodal input handling
    if (imageBase64) {
      // Strip data url prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      contents.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    let promptText = `Analyze this circuit prototype/schematic with extreme rigor.\n`;
    if (architecture && architecture !== 'general') {
      promptText += `TARGET ARCHITECTURE: ${architecture.toUpperCase()}\n`;
    }
    if (description) {
      promptText += `CIRCUIT DESCRIPTION / INTENDED FUNCTION:\n${description}\n`;
    }
    if (netlist) {
      promptText += `NETLIST / PINOUT DEFINITIONS:\n${netlist}\n`;
    }
    if (codeSnippet) {
      promptText += `EMBEDDED FIRMWARE / CODE:\n${codeSnippet}\n`;
    }
    if (userProbingNotes) {
      promptText += `USER PHYSICAL PROBE NOTES / VOLTMETER READINGS:\n${userProbingNotes}\n`;
    }

    promptText += `
Inspect thoroughly according to the CRITICAL OPERATING RULES.
You MUST output your findings strictly matching this JSON schema:
- verdict: "CORRECT" | "INCORRECT" | "WARNING / POTENTIAL ISSUE"
- identifiedErrors: array of objects with { component, pinOrNode, visualLocation, evidence, isInconclusive }
- rootCauseAndImpact: in-depth technical explanation
- stepByStepRemediation: array of step-by-step instructions
- safetyAndDamageRisk: risk of component damage or thermal runaway
- identifiedComponents: array of { name, package, designator, status: "verified"|"inconclusive"|"faulty", notes }
- continuityMatrix: array of { nodeName, pinsConnected, status: "VALID"|"OPEN_FAULT"|"SHORT_FAULT"|"INCONCLUSIVE", detail }
- electricalRuleChecks: array of { check, status: "PASS"|"FAIL"|"WARNING"|"INCONCLUSIVE", detail }
- rawMarkdownOutput: string containing the exact mandatory output layout:
  **Verdict:** [ CORRECT | INCORRECT | WARNING / POTENTIAL ISSUE ]
  **Identified Errors & Miswirings:**
  - [details]
  **Root Cause & Circuit Impact:**
  [details]
  **Step-by-Step Remediation:**
  1. [step]
  **Safety / Damage Risk:**
  [details]
`;

    contents.push({ text: promptText });

    const response = await callGeminiWithRetry({
      model: 'gemini-3.8-flash',
      contents: { parts: contents },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: {
              type: Type.STRING,
              description: 'Must be CORRECT, INCORRECT, or WARNING / POTENTIAL ISSUE',
            },
            summary: {
              type: Type.STRING,
              description: 'One sentence high-level executive summary of circuit integrity.',
            },
            identifiedErrors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  component: { type: Type.STRING },
                  pinOrNode: { type: Type.STRING },
                  visualLocation: { type: Type.STRING, description: 'Visual coordinate, row number, or breadboard coordinate' },
                  evidence: { type: Type.STRING, description: 'Concrete visual proof or state inconclusive' },
                  isInconclusive: { type: Type.BOOLEAN },
                },
                required: ['component', 'pinOrNode', 'visualLocation', 'evidence', 'isInconclusive'],
              },
            },
            rootCauseAndImpact: {
              type: Type.STRING,
            },
            stepByStepRemediation: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            safetyAndDamageRisk: {
              type: Type.STRING,
            },
            identifiedComponents: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  package: { type: Type.STRING },
                  designator: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ['verified', 'inconclusive', 'faulty'] },
                  notes: { type: Type.STRING },
                },
                required: ['name', 'package', 'designator', 'status', 'notes'],
              },
            },
            continuityMatrix: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nodeName: { type: Type.STRING },
                  pinsConnected: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ['VALID', 'OPEN_FAULT', 'SHORT_FAULT', 'INCONCLUSIVE'] },
                  detail: { type: Type.STRING },
                },
                required: ['nodeName', 'pinsConnected', 'status', 'detail'],
              },
            },
            electricalRuleChecks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  check: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ['PASS', 'FAIL', 'WARNING', 'INCONCLUSIVE'] },
                  detail: { type: Type.STRING },
                },
                required: ['check', 'status', 'detail'],
              },
            },
            rawMarkdownOutput: {
              type: Type.STRING,
              description: 'The strict markdown formatted report with Verdict, Identified Errors & Miswirings, Root Cause & Circuit Impact, Step-by-Step Remediation, Safety / Damage Risk.',
            },
          },
          required: [
            'verdict',
            'summary',
            'identifiedErrors',
            'rootCauseAndImpact',
            'stepByStepRemediation',
            'safetyAndDamageRisk',
            'identifiedComponents',
            'continuityMatrix',
            'electricalRuleChecks',
            'rawMarkdownOutput',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No response text received from analysis model.');
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error analyzing circuit:', err);
    return res.status(500).json({
      error: err.message || 'Failed to inspect circuit',
      details: err.toString(),
    });
  }
});

// Follow-up technical inquiry endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, context } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';
    const conversationHistory = messages.slice(0, -1).map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');

    let prompt = `You are the Principal Electronics and Embedded Systems Debugging Assistant.\n`;
    if (context) {
      prompt += `Current Circuit Analysis Context:\n${JSON.stringify(context, null, 2)}\n\n`;
    }
    if (conversationHistory) {
      prompt += `Prior Conversation:\n${conversationHistory}\n\n`;
    }
    prompt += `User Query: ${lastMessage}\n\nProvide a precise, rigorous engineering response without hand-wavy claims. Include exact pin numbers, resistor calculations (Ohm's law), decoupling rules, or datasheet caveats where applicable.`;

    const response = await callGeminiWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    return res.json({ reply: response.text });
  } catch (err: any) {
    console.error('Error in chat endpoint:', err);
    return res.status(500).json({ error: err.message || 'Error communicating with assistant.' });
  }
});

// Production or dev server mounting
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Hardware Debugger Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
