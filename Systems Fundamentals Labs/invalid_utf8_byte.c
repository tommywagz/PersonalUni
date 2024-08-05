// Given an UTF-8 string, return the index of the first invalid byte.
// If there are no invalid bytes, return -1.

// Do NOT change this function's return type or signature.

int continuous(char byte) {
    return (byte & 0xC0) == 0x80;
}

int invalid_utf8_byte(char *utf8_string) {
    for (int i = 0; utf8_string[i] != '\0'; i++) {
        unsigned char current_byte = (unsigned char)utf8_string[i];

        if (current_byte <= 0x7F) {
            continue;
        } else if ((current_byte & 0xE0) == 0xC0) {
            if (!continuous(utf8_string[i + 1])) {
                return i + 1;
            }
        } else if ((current_byte & 0xF0) == 0xE0) {
            if (!continuous(utf8_string[i + 1]) || !continuous(utf8_string[i + 2])) {
                return i + 1;
            }
        } else if ((current_byte & 0xF8) == 0xF0) {
            if (!continuous(utf8_string[i + 1]) || !continuous(utf8_string[i + 2]) || !continuous(utf8_string[i + 3])) {
                return i + 1;
            }
        } else  {
            return i;
        }

    }

    return -1;
}
