# Chimera

**License:** [GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html)

---

## Overview

Chimera is a simple yet powerful and customizable command-line tool to encode and decode messages using a unique, pattern-based cipher system. It was created out of the need to securely send coded messages over various communication channels like text, phone, and radio — all while keeping the output human-readable and easy to convey.

---

## Features

- **Pattern-driven multi-method cipher:** Use patterns made of characters to chain multiple transformations that alter the message.
- **Customizable alphabet:** Defaults to uppercase alphanumeric characters but can be customized to include punctuation or Unicode characters.
- **Case-insensitive:** Input and patterns are normalized to uppercase for consistency.
- **Shift customization:** Numeric suffixes on patterns let you specify custom shift values for shift-based transformations.
- **Human-readable output:** Outputs consist entirely of characters in the chosen alphabet—ideal for verbal or radio transmission.
- **Extensible:** Easily add your own transformations to customize ciphering behavior.

---

## Installation

Make sure you have [Node.js](https://nodejs.org/) installed on your system.

Clone or download this repository, then give executable permission to the script (optional):

```bash
chmod +x chimera.js
```

---

## Usage

```bash
node chimera.js <encode|decode|e|d> <pattern>[shift] <text>
```

- **encode / e:** Encode the given text using the provided pattern.
- **decode / d:** Decode the given text using the provided pattern.
- **pattern:** A string where each character specifies a transformation. Optionally, end with a number to specify a numeric shift for 'C' commands.
- **text:** The message to encode or decode.

---

### Examples

Encode a message with pattern `ACE` and default shift (5):

```bash
node chimera.js encode ACE "Hello123"
```

Encode with pattern `ACE` and shift 22 for shift operations:

```bash
node chimera.js encode ACE22 "Hello123"
```

Decode the previously encoded message:

```bash
node chimera.js decode ACE22 <encoded_text>
```

---

## Pattern Transformations

| Pattern Char | Transformation                        | Notes                                   |
|--------------|-------------------------------------|-----------------------------------------|
| A            | Reverse                             | Reverses the entire message             |
| B            | ROT13 (letters only)                | Shifts letters by 13; digits and others unchanged |
| C            | Caesar shift (custom shift)         | Shift by numeric value after pattern (default 5)|
| D            | Inverse of Caesar (+5)              | Inverse shift of 5                      |
| E            | Swap halves                        | Swaps first and second halves of message|
| H            | Rotate right by 1                   | Moves last character to front           |
| I            | Rotate left by 2                    | Moves first two characters to end       |
| J            | Atbash (full alphabet mirror)       | Reverses alphabet characters            |
| S            | Shift by pattern character index    | Shift by index of pattern char          |

---

## Custom Alphabet

You can customize the alphabet in the script (`ALPHABET` variable):

```js
let ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,<>/?~!@#%^&*()-_=+';
```

- Alphabet is automatically normalized to uppercase and deduplicated.
- Inputs and patterns are sanitized to only include characters in the alphabet.
- All shifts and transforms operate within the bounds of this alphabet.
- Adding punctuation or Unicode enables encoding non-alphanumeric messages seamlessly.

---

## License

This project is licensed under the GNU General Public License v3.0 (GPLv3).  
See [LICENSE](https://www.gnu.org/licenses/gpl-3.0.en.html) for details.

---

## Why Chimera?

Chimera was born from a desire for a **simple yet flexible way to send coded messages** across varied channels — text, phone calls, radio transmissions — where conventional ciphers may be impractical. The pattern-based approach gives you full control over how your message is transformed, allowing you to create strong, layered encryptions tailored to your needs.
