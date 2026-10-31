export interface MicrocontrollerPin {
  pin: number;
  name: string;
  type: 'POWER' | 'GND' | 'GPIO' | 'CLOCK' | 'RESET' | 'BOOT' | 'ANALOG' | 'COMM';
  description: string;
  hardwareTrap?: string;
}

export interface ArchitectureInfo {
  id: string;
  name: string;
  fullTitle: string;
  operatingVoltage: string;
  clockSpec: string;
  criticalTraps: string[];
  pins: MicrocontrollerPin[];
  resetBehavior: string;
  ercRules: string[];
}

export const ARCHITECTURES: ArchitectureInfo[] = [
  {
    id: '8051',
    name: '8051 (AT89C51 / AT89S52)',
    fullTitle: '8-bit CISC Microcontroller (Classic DIP-40)',
    operatingVoltage: '4.0V - 5.5V (Nominal 5.0V)',
    clockSpec: 'XTAL1 (Pin 19) & XTAL2 (Pin 18) with 11.0592MHz or 12MHz crystal + 30pF ± 10pF caps',
    resetBehavior: 'ACTIVE-HIGH (requires 10uF capacitor to VCC and 8.2k-10k resistor to GND for power-on reset)',
    criticalTraps: [
      'Pin 31 (/EA/VPP): MUST be tied to VCC for internal ROM/Flash execution. If floating or grounded, CPU attempts external bus fetch via Port 0 & 2 and enters infinite freeze/NOP loop.',
      'Port 0 (Pins 32-39): True open-drain without internal pull-ups! Requires external 10k resistor pack to pull lines high.',
      'Active-High Reset (Pin 9): Often wired backwards by AVR/ARM engineers who expect active-low reset.',
      'Port 1, 2, 3 have internal quasi-bidirectional pull-ups, but weak driving capability for low-to-high transitions.',
    ],
    ercRules: [
      'Pin 40 connected to +5V VCC',
      'Pin 20 connected to 0V GND',
      'Pin 31 (/EA) must not be floating; tied to VCC if no external ROM IC is present',
      'XTAL capacitors grounded to quiet analog GND plane',
    ],
    pins: [
      { pin: 1, name: 'P1.0', type: 'GPIO', description: 'Port 1 bit 0 / Timer 2' },
      { pin: 9, name: 'RST', type: 'RESET', description: 'Active-HIGH reset input', hardwareTrap: 'Requires RC network: 10uF to VCC, 8.2k-10k pull-down to GND' },
      { pin: 18, name: 'XTAL2', type: 'CLOCK', description: 'Crystal oscillator output', hardwareTrap: 'Capacitor (22-33pF) to GND required' },
      { pin: 19, name: 'XTAL1', type: 'CLOCK', description: 'Crystal oscillator input', hardwareTrap: 'Capacitor (22-33pF) to GND required' },
      { pin: 20, name: 'VSS / GND', type: 'GND', description: 'Ground (0V)' },
      { pin: 29, name: '/PSEN', type: 'COMM', description: 'Program Store Enable (for external ROM)' },
      { pin: 30, name: 'ALE//PROG', type: 'COMM', description: 'Address Latch Enable' },
      { pin: 31, name: '/EA/VPP', type: 'BOOT', description: 'External Access Enable', hardwareTrap: 'CRITICAL TRAP: Must tie to VCC (5V) to run internal flash program!' },
      { pin: 32, name: 'P0.7', type: 'GPIO', description: 'Port 0 bit 7 (Open Drain)', hardwareTrap: 'No internal pull-up; needs external 10k resistor pack' },
      { pin: 39, name: 'P0.0', type: 'GPIO', description: 'Port 0 bit 0 (Open Drain)', hardwareTrap: 'No internal pull-up; needs external 10k resistor pack' },
      { pin: 40, name: 'VCC', type: 'POWER', description: '+5V Power Supply' },
    ],
  },
  {
    id: 'lpc2148',
    name: 'ARM7TDMI (LPC2148)',
    fullTitle: 'NXP ARM7TDMI-S 32-bit MCU (64-pin LQFP)',
    operatingVoltage: '3.0V - 3.6V (I/O) & 1.8V ± 0.15V (Core)',
    clockSpec: '12MHz fundamental crystal for PLL with 18-22pF caps; optional 32.768kHz RTC',
    resetBehavior: 'ACTIVE-LOW (/RESET on Pin 57, requires external pull-up and decoupling)',
    criticalTraps: [
      'Pin 41 (P0.14): Sampled on /RESET rising edge. If LOW, enters Philips UART0 ISP Bootloader. If floating, random boot failures occur.',
      'V18 Core Power: Requires multiple low-ESR ceramic decoupling capacitors (100nF) on V18 pins or internal regulator output.',
      'Dual Supply Rails: V3 (3.3V) and V18 (1.8V) sequencing or internal regulation filtering.',
      'VBUS (Pin 6): 5V tolerant pin requires voltage divider when sensing USB cable insertion.',
    ],
    ercRules: [
      'P0.14 pull-up present for normal flash run',
      'Pin 57 (/RESET) active-low with proper pull-up to 3.3V',
      '100nF bypass capacitors on every V3/VSS pair',
    ],
    pins: [
      { pin: 6, name: 'VBUS', type: 'COMM', description: 'USB Cable 5V Detect', hardwareTrap: 'Requires divider or 5V protection resistor' },
      { pin: 41, name: 'P0.14', type: 'BOOT', description: 'GPIO / ISP Hardware Entry', hardwareTrap: 'Sampled on reset: HIGH = User Code, LOW = ISP Bootloader' },
      { pin: 57, name: '/RESET', type: 'RESET', description: 'Active-LOW reset', hardwareTrap: 'Must have pull-up to 3.3V' },
      { pin: 23, name: 'V3', type: 'POWER', description: '3.3V I/O Power' },
      { pin: 50, name: 'V18', type: 'POWER', description: '1.8V Core Power / Regulator filter' },
      { pin: 25, name: 'VSS', type: 'GND', description: 'Ground' },
    ],
  },
  {
    id: 'avr_arduino',
    name: 'AVR (ATmega328P / Arduino Uno)',
    fullTitle: '8-bit AVR RISC Microcontroller (DIP-28 / TQFP-32)',
    operatingVoltage: '1.8V - 5.5V (Standard Arduino runs 5.0V @ 16MHz)',
    clockSpec: '16MHz ceramic resonator or crystal between Pins 9 & 10 with 22pF caps',
    resetBehavior: 'ACTIVE-LOW (Pin 1 /RESET requires 10k pull-up to 5V; 100nF series cap for DTR auto-reset)',
    criticalTraps: [
      'Pin 20 (AVCC): MUST be connected to VCC (ideally via LC filter). Leaving AVCC unconnected causes Port C and ADC malfunction, and erratic CPU operation!',
      'Pin 21 (AREF): Never tie directly to 5V rail if firmware configures analogReference(INTERNAL) - this burns the internal 1.1V bandgap diode!',
      'GND (Pins 8 & 22): Both GND pins must be tied to circuit common ground.',
      'LED on SCK (Pin 19 / D13): Built-in LED on Arduino Uno can load SPI clock lines in high-speed SPI modes.',
    ],
    ercRules: [
      'AVCC (Pin 20) tied to VCC rail',
      'Pin 1 (/RESET) pull-up resistor present',
      'Decoupling capacitors present adjacent to Pin 7 and Pin 20',
    ],
    pins: [
      { pin: 1, name: '/RESET (PC6)', type: 'RESET', description: 'Active-LOW reset', hardwareTrap: '10k pull-up to 5V required' },
      { pin: 7, name: 'VCC', type: 'POWER', description: '+5V Digital Supply' },
      { pin: 8, name: 'GND', type: 'GND', description: 'Ground' },
      { pin: 9, name: 'XTAL1 (PB6)', type: 'CLOCK', description: '16MHz Crystal In' },
      { pin: 10, name: 'XTAL2 (PB7)', type: 'CLOCK', description: '16MHz Crystal Out' },
      { pin: 20, name: 'AVCC', type: 'POWER', description: 'Analog VCC', hardwareTrap: 'CRITICAL: Must connect to VCC even if ADC is not used!' },
      { pin: 21, name: 'AREF', type: 'ANALOG', description: 'Analog Reference', hardwareTrap: 'Do NOT wire to 5V if internal 1.1V reference is selected in code' },
      { pin: 22, name: 'GND', type: 'GND', description: 'Ground' },
    ],
  },
  {
    id: 'stm32',
    name: 'STM32 (STM32F103 Cortex-M3)',
    fullTitle: 'ARM 32-bit Cortex-M3 "Blue Pill" / STM32F103C8T6',
    operatingVoltage: '2.0V - 3.6V (Nominal 3.3V)',
    clockSpec: '8MHz HSE crystal + 32.768kHz LSE crystal; internal 8MHz HSI fallback',
    resetBehavior: 'ACTIVE-LOW (NRST requires 100nF cap to GND and internal pull-up)',
    criticalTraps: [
      'BOOT0 Pin: Must be pulled LOW to GND (via 100k or jumper) to boot from user flash. If left floating or pulled HIGH, device boots into system ROM DFU/UART bootloader.',
      'Blue Pill USB R10 resistor bug: Many cheap clone boards have 10k or 4.7k instead of 1.5k on USB D+ pull-up, failing USB enumeration.',
      'VDDA / VSSA: Analog supply pins must be powered with 3.3V and decoupled with 100nF + 1uF.',
      '5V Tolerance: Not all GPIOs are 5V tolerant! Only pins marked FT (Five-Volt Tolerant) can withstand 5V logic inputs.',
    ],
    ercRules: [
      'BOOT0 connected to GND for Flash execution',
      'All VDD pins (Pins 9, 24, 36, 48) tied to 3.3V with 100nF decoupling each',
      'NRST filter capacitor present',
    ],
    pins: [
      { pin: 7, name: 'NRST', type: 'RESET', description: 'Active-LOW reset', hardwareTrap: '100nF filter capacitor to GND recommended' },
      { pin: 9, name: 'VDDA', type: 'POWER', description: 'Analog 3.3V Power', hardwareTrap: 'Must be connected to 3.3V supply' },
      { pin: 44, name: 'BOOT0', type: 'BOOT', description: 'Boot configuration pin', hardwareTrap: 'CRITICAL: Must tie to GND (0V) to execute user Flash code' },
    ],
  },
];
