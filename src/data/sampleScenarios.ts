export interface SampleScenario {
  id: string;
  title: string;
  category: '8051' | 'Breadboard' | 'Analog/LED' | 'ARM7' | 'AVR' | 'STM32';
  expectedVerdict: 'INCORRECT' | 'WARNING / POTENTIAL ISSUE' | 'CORRECT';
  tag: string;
  description: string;
  netlist?: string;
  codeSnippet?: string;
  userProbingNotes?: string;
  imageSvg: string;
  expectedFaults: string[];
}

export const SAMPLE_SCENARIOS: SampleScenario[] = [
  {
    id: '8051-floating-ea',
    title: '8051 Minimal System: Floating /EA Pin 31 & Port 0 LEDs',
    category: '8051',
    expectedVerdict: 'INCORRECT',
    tag: 'Classic 8051 Hardware Trap',
    description: 'User wired an AT89C51 on an 830-point breadboard. Crystal oscillator (11.0592MHz) with two 30pF caps is wired to pins 18 & 19. Pin 40 is wired to +5V rail, Pin 20 to GND. Pin 9 (RST) has a 10uF cap to +5V and 10k resistor to GND. However, Pin 31 (/EA/VPP) is left completely floating with no wire jumper. Furthermore, 8 LEDs are wired to Port 0 (Pins 32-39) to GND with 330 ohm resistors, but without an external pull-up resistor pack.',
    userProbingNotes: 'Oscilloscope shows 11.0592MHz clock running fine on Pin 18. RST pin is resting at 0.05V after power-on surge. But code never executes! LEDs on Port 0 are completely unlit.',
    netlist: `U1 AT89C51 DIP40:
  Pin 40 (VCC) -> +5V Rail
  Pin 20 (GND) -> GND Rail
  Pin 18 (XTAL2) -> Crystal pin 1 + 30pF to GND
  Pin 19 (XTAL1) -> Crystal pin 2 + 30pF to GND
  Pin 9 (RST) -> 10uF cap to +5V, 10k resistor to GND, push-button to +5V
  Pin 31 (/EA/VPP) -> [NO WIRE / FLOATING]
  Pins 32..39 (P0.0..P0.7) -> 330R resistors -> LED Anodes -> LED Cathodes to GND
  Pins 32..39 (Port 0) -> [NO PULL-UP RESISTOR SIP PACK TO 5V]`,
    expectedFaults: [
      'Pin 31 (/EA/VPP) is floating. On 8051, Pin 31 MUST be connected to +5V (VCC) to fetch instructions from internal flash. When floating or low, CPU fetches from external address space on P0/P2, resulting in immediate freeze.',
      'Port 0 (Pins 32-39) are open-drain outputs with no internal pull-up transistors. Driving LEDs directly to GND cannot work without pull-up resistors to VCC or sinking current to ground.',
    ],
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" class="w-full h-auto">
  <defs>
    <pattern id="grid8051" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect width="800" height="500" fill="#090d16"/>
  <rect width="800" height="500" fill="url(#grid8051)"/>
  
  <!-- Breadboard outline -->
  <rect x="40" y="40" width="720" height="420" rx="12" fill="#131b2e" stroke="#334155" stroke-width="2"/>
  
  <!-- Rails -->
  <line x1="60" y1="60" x2="740" y2="60" stroke="#ef4444" stroke-width="3" stroke-dasharray="10 4"/>
  <text x="65" y="55" fill="#ef4444" font-size="10" font-family="monospace">+5V VCC RAIL</text>
  <line x1="60" y1="80" x2="740" y2="80" stroke="#3b82f6" stroke-width="3" stroke-dasharray="10 4"/>
  <text x="65" y="95" fill="#3b82f6" font-size="10" font-family="monospace">0V GND RAIL</text>
  
  <!-- IC DIP-40 AT89C51 -->
  <rect x="250" y="140" width="280" height="220" rx="6" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
  <!-- Notch -->
  <path d="M 240 250 A 15 15 0 0 0 250 250" fill="none" stroke="#64748b" stroke-width="2"/>
  <circle cx="270" cy="160" r="4" fill="#94a3b8"/>
  <text x="320" y="240" fill="#f8fafc" font-size="16" font-weight="bold" font-family="monospace">AT89C51 / 8051</text>
  <text x="350" y="265" fill="#94a3b8" font-size="12" font-family="monospace">DIP-40</text>
  
  <!-- Pin 40 VCC wire -->
  <path d="M 280 140 L 280 60" fill="none" stroke="#ef4444" stroke-width="3"/>
  <circle cx="280" cy="140" r="4" fill="#ef4444"/>
  <text x="260" y="130" fill="#fca5a5" font-size="10" font-family="monospace">Pin 40 (VCC)</text>
  
  <!-- Pin 20 GND wire -->
  <path d="M 280 360 L 280 430 L 740 430" fill="none" stroke="#3b82f6" stroke-width="3"/>
  <circle cx="280" cy="360" r="4" fill="#3b82f6"/>
  <text x="260" y="380" fill="#93c5fd" font-size="10" font-family="monospace">Pin 20 (GND)</text>
  
  <!-- Pin 31 /EA/VPP - THE TRAP: FLOATING PIN -->
  <circle cx="430" cy="140" r="6" fill="#f43f5e" stroke="#ffe4e6" stroke-width="2"/>
  <text x="405" y="125" fill="#fb7185" font-size="11" font-weight="bold" font-family="monospace">Pin 31 (/EA)</text>
  <!-- Floating Callout -->
  <line x1="430" y1="140" x2="490" y2="100" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="3 3"/>
  <rect x="490" y="80" width="180" height="36" rx="4" fill="#881337" stroke="#f43f5e" stroke-width="1.5"/>
  <text x="500" y="98" fill="#ffe4e6" font-size="10" font-weight="bold" font-family="sans-serif">FAULT: PIN 31 FLOATING!</text>
  <text x="500" y="110" fill="#fecdd3" font-size="9" font-family="sans-serif">Must tie to +5V for internal flash</text>

  <!-- Crystal on Pin 18, 19 -->
  <rect x="140" y="270" width="40" height="24" rx="2" fill="#475569" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="145" y="286" fill="#f8fafc" font-size="9" font-family="monospace">11.059M</text>
  <path d="M 180 278 L 250 278" stroke="#cbd5e1" stroke-width="2"/>
  <path d="M 180 286 L 250 286" stroke="#cbd5e1" stroke-width="2"/>
  <text x="185" y="272" fill="#94a3b8" font-size="9" font-family="monospace">Pin 18/19 XTAL</text>
  
  <!-- Reset Circuit on Pin 9 -->
  <rect x="130" y="170" width="30" height="15" fill="#334155" stroke="#64748b"/>
  <text x="133" y="181" fill="#cbd5e1" font-size="8" font-family="monospace">10k</text>
  <path d="M 160 178 L 250 178" stroke="#10b981" stroke-width="2"/>
  <text x="180" y="172" fill="#6ee7b7" font-size="9" font-family="monospace">Pin 9 (RST)</text>

  <!-- Port 0 LEDs without pull-ups -->
  <g transform="translate(560, 180)">
    <text x="0" y="0" fill="#f59e0b" font-size="10" font-weight="bold" font-family="monospace">P0.0 - P0.7 (Pins 32-39)</text>
    <text x="0" y="14" fill="#fcd34d" font-size="9" font-family="sans-serif">⚠️ Missing 10k Pull-Up Pack</text>
    <rect x="0" y="24" width="160" height="70" rx="4" fill="#1e1b4b" stroke="#6366f1" stroke-width="1"/>
    <text x="10" y="44" fill="#c7d2fe" font-size="9" font-family="monospace">LEDs direct to GND</text>
    <text x="10" y="60" fill="#a5b4fc" font-size="8" font-family="sans-serif">Port 0 is Open-Drain</text>
    <text x="10" y="76" fill="#f43f5e" font-size="8" font-family="sans-serif">Cannot output HIGH logic!</text>
  </g>
</svg>`,
  },
  {
    id: 'breadboard-split-rail-gap',
    title: 'Standard Breadboard Power Rail Center Split Gap',
    category: 'Breadboard',
    expectedVerdict: 'INCORRECT',
    tag: 'Physical Breadboard Gotcha',
    description: 'User powered the top-left power rails of a full-size 830-tie-point solderless breadboard with +5V and GND from a benchtop PSU. An ATmega328P and sensor IC are seated on the right half (columns 35-50). However, standard 830-point breadboards have an intentional split in the center of the power distribution buses between columns 30 and 31. No bridging jumpers are placed across the center gap, leaving the entire right rail completely unpowered (0.00V).',
    userProbingNotes: 'Voltmeter measures +5.01V at column 5 power rail. But measuring at Pin 7 of the IC at column 40 reads 0.00V! The IC is completely dead.',
    expectedFaults: [
      'The positive (+5V) and negative (GND) distribution rails on this breadboard are physically split between tie-point columns 30 and 31. Without jumper wires bridging this center gap, voltage is not transferred to the right half where the microcontroller is seated.',
    ],
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" class="w-full h-auto">
  <rect width="800" height="480" fill="#090d16"/>
  <!-- Breadboard Body -->
  <rect x="30" y="40" width="740" height="400" rx="12" fill="#182234" stroke="#475569" stroke-width="2"/>
  
  <!-- Left Side + Rail (Powered) -->
  <line x1="60" y1="70" x2="370" y2="70" stroke="#ef4444" stroke-width="4"/>
  <text x="80" y="62" fill="#ef4444" font-size="11" font-weight="bold" font-family="monospace">+5V (ACTIVE)</text>
  
  <!-- Left Side - Rail (Powered) -->
  <line x1="60" y1="95" x2="370" y2="95" stroke="#3b82f6" stroke-width="4"/>
  <text x="80" y="112" fill="#3b82f6" font-size="11" font-weight="bold" font-family="monospace">GND (0V ACTIVE)</text>

  <!-- THE CENTER SPLIT GAP -->
  <rect x="370" y="55" width="60" height="55" rx="4" fill="#450a0a" stroke="#ef4444" stroke-width="2"/>
  <text x="375" y="80" fill="#fca5a5" font-size="9" font-weight="bold" font-family="monospace">SPLIT GAP</text>
  <text x="373" y="96" fill="#f87171" font-size="8" font-family="sans-serif">NO JUMPER!</text>

  <!-- Right Side + Rail (DEAD 0V) -->
  <line x1="430" y1="70" x2="740" y2="70" stroke="#ef4444" stroke-width="2" stroke-dasharray="6 4" opacity="0.4"/>
  <text x="460" y="62" fill="#fca5a5" font-size="11" font-weight="bold" font-family="monospace">+5V RAIL (FLOATING / 0.0V)</text>

  <!-- Right Side - Rail (DEAD 0V) -->
  <line x1="430" y1="95" x2="740" y2="95" stroke="#3b82f6" stroke-width="2" stroke-dasharray="6 4" opacity="0.4"/>
  <text x="460" y="112" fill="#93c5fd" font-size="11" font-weight="bold" font-family="monospace">GND RAIL (FLOATING / 0.0V)</text>

  <!-- Microcontroller on right side -->
  <rect x="520" y="180" width="160" height="180" rx="4" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
  <text x="545" y="270" fill="#f8fafc" font-size="13" font-weight="bold" font-family="monospace">ATmega328P</text>
  <text x="550" y="290" fill="#94a3b8" font-size="10" font-family="monospace">(Cols 38-45)</text>

  <!-- Jumper from dead rail to IC Pin 7 -->
  <path d="M 540 70 L 540 180" stroke="#f43f5e" stroke-width="2.5" stroke-dasharray="4 2"/>
  <circle cx="540" cy="70" r="4" fill="#f43f5e"/>
  <circle cx="540" cy="180" r="4" fill="#f43f5e"/>
  <text x="460" y="150" fill="#f43f5e" font-size="10" font-family="monospace">Wire to VCC Pin 7</text>

  <!-- Visual Remediation Banner -->
  <rect x="60" y="380" width="680" height="46" rx="6" fill="#022c22" stroke="#10b981" stroke-width="1.5"/>
  <text x="80" y="408" fill="#34d399" font-size="12" font-weight="bold" font-family="sans-serif">REMEDIATION: Insert two jumper wires across center gap (Col 30 to Col 31) for both (+) and (-) rails.</text>
</svg>`,
  },
  {
    id: 'led-direct-gpio-hazard',
    title: 'LED Wired Directly to MCU GPIO Without Current-Limiting Resistor',
    category: 'Analog/LED',
    expectedVerdict: 'INCORRECT',
    tag: 'Thermal & Overcurrent Hazard',
    description: 'High-brightness Red LED cathode is wired directly to breadboard GND rail, and anode is plugged directly into microcontroller GPIO output (e.g. Arduino Pin D9 / ATmega328P Pin 15) without any series current-limiting resistor. Microcontroller output voltage is 5.0V with forward voltage of LED ~2.0V.',
    userProbingNotes: 'When GPIO is driven HIGH, LED flashed extremely brightly for 2 seconds, smelled hot, and then went dark. GPIO pin now reads 0V permanently.',
    expectedFaults: [
      'Missing series current-limiting resistor between GPIO output and LED anode. ATmega328P absolute maximum rating per I/O pin is 40mA. A direct connection causes >150mA pulse, destroying the internal output driver FET and overheating the LED junction.',
    ],
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" class="w-full h-auto">
  <rect width="800" height="450" fill="#090d16"/>
  <rect x="40" y="40" width="720" height="370" rx="10" fill="#131c2d" stroke="#334155" stroke-width="2"/>
  
  <!-- MCU Block -->
  <rect x="80" y="120" width="220" height="200" rx="6" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
  <text x="120" y="210" fill="#f8fafc" font-size="15" font-weight="bold" font-family="monospace">MCU GPIO (5V Logic)</text>
  <text x="120" y="235" fill="#94a3b8" font-size="11" font-family="monospace">Max Rating: 40mA</text>

  <!-- Direct Wire (Fault) -->
  <path d="M 300 220 L 460 220" stroke="#f43f5e" stroke-width="4"/>
  <circle cx="300" cy="220" r="5" fill="#f43f5e"/>
  
  <!-- LED Symbol -->
  <g transform="translate(460, 180)">
    <polygon points="0,40 40,20 0,0" fill="#dc2626" stroke="#f87171" stroke-width="2"/>
    <line x1="40" y1="0" x2="40" y2="40" stroke="#f87171" stroke-width="3"/>
    <!-- Light rays -->
    <line x1="30" y1="0" x2="45" y2="-15" stroke="#f87171" stroke-width="2"/>
    <line x1="40" y1="5" x2="55" y2="-10" stroke="#f87171" stroke-width="2"/>
    <text x="-15" y="-10" fill="#f87171" font-size="12" font-weight="bold" font-family="monospace">RED LED (Vf = 2.0V)</text>
  </g>

  <!-- Cathode to GND -->
  <path d="M 500 220 L 650 220 L 650 340" stroke="#3b82f6" stroke-width="3"/>
  <circle cx="650" cy="340" r="5" fill="#3b82f6"/>
  <text x="610" y="360" fill="#60a5fa" font-size="12" font-weight="bold" font-family="monospace">GND (0V)</text>

  <!-- Thermal Hazard Badge -->
  <rect x="310" y="80" width="360" height="70" rx="6" fill="#450a0a" stroke="#f43f5e" stroke-width="2"/>
  <text x="325" y="105" fill="#fca5a5" font-size="12" font-weight="bold" font-family="sans-serif">CRITICAL THERMAL & OVERCURRENT RISK</text>
  <text x="325" y="125" fill="#fecdd3" font-size="10" font-family="sans-serif">V_drop = (5.0V - 2.0V) = 3.0V across 0 ohms.</text>
  <text x="325" y="140" fill="#fecdd3" font-size="10" font-family="sans-serif">Current exceeds 200mA, destroying internal FET & LED.</text>
</svg>`,
  },
  {
    id: 'lpc2148-isp-boot-floating',
    title: 'ARM7 LPC2148: P0.14 Floating During Power-On Reset',
    category: 'ARM7',
    expectedVerdict: 'WARNING / POTENTIAL ISSUE',
    tag: 'ARM7 Boot Configuration Trap',
    description: 'An LPC2148 custom breakout board powered with 3.3V I/O supply and filtered 1.8V core regulator. /RESET (Pin 57) has 10k pull-up to 3.3V and 100nF cap to ground. 12MHz crystal with 20pF caps is connected. However, Pin 41 (P0.14) has no external pull-up resistor and is left completely floating on the header.',
    userProbingNotes: 'The MCU sometimes starts user code, but after cold power cycles it frequently hangs in bootloader mode, refusing to execute the main() LED blinky routine until touched with a finger.',
    expectedFaults: [
      'P0.14 (Pin 41) is the ISP hardware entry pin sampled by on-chip bootloader on /RESET rising edge. When left floating, stray electromagnetic fields or board capacitance can float it LOW, inadvertently triggering the Philips UART0 ISP Bootloader rather than executing user flash.',
    ],
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" class="w-full h-auto">
  <rect width="800" height="450" fill="#090d16"/>
  <rect x="50" y="40" width="700" height="370" rx="10" fill="#111827" stroke="#374151" stroke-width="2"/>
  
  <!-- LPC2148 LQFP64 -->
  <rect x="260" y="120" width="260" height="220" rx="8" fill="#030712" stroke="#4b5563" stroke-width="2"/>
  <text x="310" y="220" fill="#f9fafb" font-size="15" font-weight="bold" font-family="monospace">NXP LPC2148</text>
  <text x="325" y="245" fill="#9ca3af" font-size="11" font-family="monospace">ARM7TDMI-S</text>

  <!-- P0.14 Pin 41 -->
  <circle cx="520" cy="190" r="5" fill="#f59e0b"/>
  <text x="535" y="195" fill="#fbbf24" font-size="11" font-weight="bold" font-family="monospace">Pin 41 (P0.14 / ISP)</text>
  <line x1="520" y1="190" x2="620" y2="190" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 2"/>
  <text x="630" y="195" fill="#fcd34d" font-size="10" font-family="monospace">[FLOATING PIN]</text>

  <!-- Warning Box -->
  <rect x="100" y="70" width="600" height="40" rx="6" fill="#451a03" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="120" y="95" fill="#fef3c7" font-size="11" font-weight="bold" font-family="sans-serif">BOOT TRAP: P0.14 MUST BE PULLED HIGH VIA 10k TO 3.3V FOR USER FLASH EXECUTION</text>
</svg>`,
  },
  {
    id: 'correct-555-astable-circuit',
    title: '555 Astable Multivibrator (Verified Correct - Zero False Positives)',
    category: 'Analog/LED',
    expectedVerdict: 'CORRECT',
    tag: 'Sound Circuit Proof',
    description: 'NE555 Timer IC configured as standard astable multivibrator. Pin 1 = GND (0V), Pin 8 = VCC (+9V), Pin 4 (RESET) = tied directly to Pin 8 (VCC), Pin 5 (CONTROL) = 10nF ceramic cap to GND, Pin 2 (TRIGGER) tied to Pin 6 (THRESHOLD), Timing resistor R1 (10k) from Pin 8 to Pin 7 (DISCHARGE), Timing resistor R2 (47k) from Pin 7 to Pin 6/2, Timing capacitor C1 (10uF electrolytic) from Pin 6/2 to GND, Output Pin 3 has 1k resistor in series with standard LED to GND. 100uF decoupling capacitor across Pin 8 and Pin 1.',
    userProbingNotes: 'Oscilloscope Pin 3: Clean square wave at ~1.2 Hz with 55% duty cycle. Pin 2/6: Classic exponential charge/discharge sawtooth between 1/3 VCC and 2/3 VCC.',
    expectedFaults: [],
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" class="w-full h-auto">
  <rect width="800" height="450" fill="#090d16"/>
  <rect x="40" y="40" width="720" height="370" rx="10" fill="#0f172a" stroke="#10b981" stroke-width="2"/>
  
  <text x="60" y="70" fill="#34d399" font-size="14" font-weight="bold" font-family="monospace">VERIFIED SOUND CIRCUIT: NE555 ASTABLE OSCILLATOR</text>
  
  <!-- NE555 DIP-8 -->
  <rect x="280" y="130" width="220" height="180" rx="6" fill="#020617" stroke="#334155" stroke-width="2"/>
  <text x="340" y="225" fill="#f8fafc" font-size="16" font-weight="bold" font-family="monospace">NE555P</text>
  <text x="350" y="245" fill="#94a3b8" font-size="11" font-family="monospace">DIP-8</text>

  <!-- Pins -->
  <text x="210" y="160" fill="#94a3b8" font-size="10" font-family="monospace">Pin 1 (GND)</text>
  <text x="210" y="200" fill="#94a3b8" font-size="10" font-family="monospace">Pin 2 (TRIG)</text>
  <text x="210" y="240" fill="#94a3b8" font-size="10" font-family="monospace">Pin 3 (OUT)</text>
  <text x="210" y="280" fill="#94a3b8" font-size="10" font-family="monospace">Pin 4 (RST)</text>

  <text x="510" y="160" fill="#94a3b8" font-size="10" font-family="monospace">Pin 8 (VCC)</text>
  <text x="510" y="200" fill="#94a3b8" font-size="10" font-family="monospace">Pin 7 (DISCH)</text>
  <text x="510" y="240" fill="#94a3b8" font-size="10" font-family="monospace">Pin 6 (THRESH)</text>
  <text x="510" y="280" fill="#94a3b8" font-size="10" font-family="monospace">Pin 5 (CTRL)</text>

  <!-- Green check badge -->
  <rect x="180" y="340" width="440" height="40" rx="6" fill="#064e3b" stroke="#10b981" stroke-width="1.5"/>
  <text x="200" y="365" fill="#a7f3d0" font-size="12" font-weight="bold" font-family="sans-serif">ALL ELECTRICAL RULES VERIFIED. ZERO FALSE POSITIVES DETECTED.</text>
</svg>`,
  },
  {
    id: 'inconclusive-dense-wire-clutter',
    title: 'Dense Wire Clutter & Visual Occlusion (Uncertainty Handling Rule)',
    category: 'Breadboard',
    expectedVerdict: 'WARNING / POTENTIAL ISSUE',
    tag: 'Uncertainty Rule Demonstration',
    description: 'A physical breadboard photo taken from a 45-degree angle with multiple bundled jumper wires passing directly over an STM32 Blue Pill development board. Pin PA9 (USART1_TX) and Pin PA10 (USART1_RX) have wires running underneath an opaque 16x2 LCD ribbon cable, making it visually impossible to determine whether the RX/TX lines are crossed or straight.',
    userProbingNotes: 'UART terminal on PC receives garbage characters or nothing when typing.',
    expectedFaults: [
      '[INCONCLUSIVE: Cannot clearly trace wire path due to visual angle and ribbon cable occlusion between STM32 PA9/PA10 and USB-UART adapter header]',
    ],
    imageSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" class="w-full h-auto">
  <rect width="800" height="450" fill="#090d16"/>
  <rect x="40" y="40" width="720" height="370" rx="10" fill="#1e1e24" stroke="#eab308" stroke-width="2"/>
  
  <text x="60" y="70" fill="#facc15" font-size="14" font-weight="bold" font-family="monospace">UNCERTAINTY BENCHMARK: WIRE CLUTTER & OCCLUSION</text>
  
  <!-- Ribbon cable blocking view -->
  <rect x="250" y="140" width="280" height="150" fill="#3f3f46" stroke="#71717a" stroke-width="2"/>
  <text x="290" y="220" fill="#e4e4e7" font-size="14" font-weight="bold" font-family="monospace">OPAQUE LCD RIBBON CABLE</text>
  <text x="310" y="240" fill="#a1a1aa" font-size="11" font-family="monospace">(Visual path occluded)</text>

  <!-- Wire loops peeking out -->
  <path d="M 120 180 Q 200 120 250 180" stroke="#f43f5e" stroke-width="3" fill="none"/>
  <path d="M 530 180 Q 600 120 680 180" stroke="#f43f5e" stroke-width="3" fill="none" stroke-dasharray="4 4"/>
  
  <!-- Inconclusive banner -->
  <rect x="100" y="330" width="600" height="50" rx="6" fill="#422006" stroke="#eab308" stroke-width="1.5"/>
  <text x="120" y="355" fill="#fef08a" font-size="11" font-weight="bold" font-family="monospace">[INCONCLUSIVE: Cannot clearly trace wire path due to visual angle]</text>
  <text x="120" y="370" fill="#fde047" font-size="10" font-family="sans-serif">Assistant complies strictly with Rule #3: Never assumes wiring is broken without visual proof.</text>
</svg>`,
  },
];
