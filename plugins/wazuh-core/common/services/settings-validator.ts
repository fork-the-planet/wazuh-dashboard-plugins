import path from 'path';
import { formatBytes } from './file-size';

export const SettingsValidator = {
  /**
   * Create a function that is a composition of the input validations
   * @param functions SettingsValidator functions to compose
   * @returns composed validation
   */
  compose(...functions: ((value: any) => string | undefined)[]) {
    return function composedValidation(value: any) {
      for (const callback of functions) {
        const result = callback(value);

        if (typeof result === 'string' && result.length > 0) {
          return result;
        }
      }
    };
  },

  /**
   * Check the value is a string
   * @param value
   * @returns
   */
  isString(value: unknown): string | undefined {
    return typeof value === 'string' ? undefined : 'Value is not a string.';
  },

  /**
   * Check the string has no spaces
   * @param value
   * @returns
   */
  hasNoSpaces(value: string): string | undefined {
    return /^\S*$/.test(value) ? undefined : 'No whitespaces allowed.';
  },

  /**
   * Check the string has no empty
   * @param value
   * @returns
   */
  isNotEmptyString(value: string): string | undefined {
    if (typeof value === 'string') {
      if (value.length === 0) {
        return 'Value can not be empty.';
      } else {
        return undefined;
      }
    }
  },

  /**
   * Check the number of string lines is limited
   * @param options
   * @returns
   */
  multipleLinesString(
    options: { minRows?: number; maxRows?: number; maxLength?: number } = {},
  ) {
    return function (value: string) {
      const lines = value.split(/\r\n|\r|\n/).length;
      const maxLength = options.maxLength;

      if (
        maxLength !== undefined &&
        value.split('\n').some(line => line.length > maxLength)
      ) {
        return `The maximum length of a line is ${maxLength} characters.`;
      }

      if (options.minRows !== undefined && lines < options.minRows) {
        return `The string should have more or ${options.minRows} line/s.`;
      }

      if (options.maxRows !== undefined && lines > options.maxRows) {
        return `The string should have less or equal to ${options.maxRows} line/s.`;
      }
    };
  },

  /**
   * Creates a function that checks the string does not contain some characters
   * @param invalidCharacters
   * @returns
   */
  hasNotInvalidCharacters(...invalidCharacters: string[]) {
    return function (value: string): string | undefined {
      return invalidCharacters.some(invalidCharacter =>
        value.includes(invalidCharacter),
      )
        ? `It can't contain invalid characters: ${invalidCharacters.join(
            ', ',
          )}.`
        : undefined;
    };
  },

  /**
   * Creates a function that checks the string does not start with a substring
   * @param invalidStartingCharacters
   * @returns
   */
  noStartsWithString(...invalidStartingCharacters: string[]) {
    return function (value: string): string | undefined {
      return invalidStartingCharacters.some(invalidStartingCharacter =>
        value.startsWith(invalidStartingCharacter),
      )
        ? `It can't start with: ${invalidStartingCharacters.join(', ')}.`
        : undefined;
    };
  },

  /**
   * Creates a function that checks the string is not equals to some values
   * @param invalidLiterals
   * @returns
   */
  noLiteralString(...invalidLiterals: string[]) {
    return function (value: string): string | undefined {
      return invalidLiterals.includes(value)
        ? `It can't be: ${invalidLiterals.join(', ')}.`
        : undefined;
    };
  },

  /**
   * Check the value is a boolean
   * @param value
   * @returns
   */
  isBoolean(value: string): string | undefined {
    return typeof value === 'boolean'
      ? undefined
      : 'It should be a boolean. Allowed values: true or false.';
  },

  /**
   * Check the value is a number
   * @param value
   * @returns
   */
  isNumber(value: string): string | undefined {
    return typeof value === 'number' ? undefined : 'Value is not a number.';
  },

  /**
   * Check the value is a number between some optional limits
   * @param options
   * @returns
   */
  number(options: { min?: number; max?: number; integer?: boolean } = {}) {
    return function (value: number) {
      if (typeof value !== 'number') {
        return 'Value is not a number.';
      }

      if (options.integer && !Number.isInteger(Number(value))) {
        return 'Number should be an integer.';
      }

      if (options.min !== undefined && value < options.min) {
        return `Value should be greater or equal than ${options.min}.`;
      }

      if (options.max !== undefined && value > options.max) {
        return `Value should be lower or equal than ${options.max}.`;
      }
    };
  },

  /**
   * Creates a function that checks if the value is a json
   * @param validateParsed Optional parameter to validate the parsed object
   * @returns
   */
  json(validateParsed: (object: any) => string | undefined) {
    return function (value: string) {
      let jsonObject;

      // Try to parse the string as JSON
      try {
        jsonObject = JSON.parse(value);
      } catch {
        return "Value can't be parsed. There is some error.";
      }

      return validateParsed ? validateParsed(jsonObject) : undefined;
    };
  },

  /**
   * Creates a function that checks is the value is an array and optionally validates each element
   * @param validationElement Optional function to validate each element of the array
   * @returns
   */
  array(validationElement: (json: any) => string | undefined) {
    return function (value: unknown[]) {
      // Check the JSON is an array
      if (!Array.isArray(value)) {
        return 'Value is not a valid list.';
      }

      let index: number;

      return validationElement
        ? (index = value.findIndex(element => validationElement(element))) >= 0
          ? validationElement(value[index])
          : undefined
        : undefined;
    };
  },

  /**
   * Creates a function that checks if the value is equal to list of values
   * @param literals Array of values to compare
   * @returns
   */
  literal(literals: unknown[]) {
    return function (value: any): string | undefined {
      return literals.includes(value)
        ? undefined
        : `Invalid value. Allowed values: ${literals.map(String).join(', ')}.`;
    };
  },

  // FilePicker
  filePickerSupportedExtensions:
    (extensions: string[]) => (options: { name: string }) => {
      if (options === undefined || options.name === undefined) {
        return;
      }

      if (!extensions.includes(path.extname(options.name))) {
        return `File extension is invalid. Allowed file extensions: ${extensions.join(
          ', ',
        )}.`;
      }
    },

  /**
   * filePickerFileSize
   * @param options
   */
  filePickerFileSize:
    (options: {
      maxBytes?: number;
      minBytes?: number;
      meaningfulUnit?: boolean;
    }) =>
    (value: { size: number }) => {
      if (value === undefined || value.size === undefined) {
        return;
      }

      if (options.minBytes !== undefined && value.size <= options.minBytes) {
        return `File size should be greater or equal than ${
          options.meaningfulUnit
            ? formatBytes(options.minBytes)
            : `${options.minBytes} bytes`
        }.`;
      }

      if (options.maxBytes !== undefined && value.size >= options.maxBytes) {
        return `File size should be lower or equal than ${
          options.meaningfulUnit
            ? formatBytes(options.maxBytes)
            : `${options.maxBytes} bytes`
        }.`;
      }
    },

  // IPv4: This is a set of four numbers, for example, 192.158.1.38. Each number in the set can range from 0 to 255. Therefore, the full range of IP addresses goes from 0.0.0.0 to 255.255.255.255
  // IPv6: This is a set or eight hexadecimal expressions, each from 0000 to FFFF. 2001:0db8:85a3:0000:0000:8a2e:0370:7334

  // FQDN: Maximum of 63 characters per label.
  // Can only contain numbers, letters and hyphens (-)
  // Labels cannot begin or end with a hyphen
  // Currently supports multilingual characters, i.e. letters not included in the English alphabet: e.g. á é í ó ú ü ñ.
  // Minimum 3 labels
  // A label can contain only numbers

  // Hostname: Maximum of 63 characters per label. Same rules as FQDN apply.

  serverAddressHostnameFQDNIPv4IPv6(value: string) {
    const isFQDNOrHostname =
      /^(?!-)(?!.*--)[\dA-Za-záéíñóúü-]{0,62}[\dA-Za-záéíñóúü](?:\.[\dA-Za-záéíñóúü-]{0,62}[\dA-Za-záéíñóúü])*$/;
    const isIPv6 = /^(?:[\dA-Fa-f]{4}:){7}[\dA-Fa-f]{4}$/;

    if (
      value.length > 255 ||
      (value.length > 0 && !isFQDNOrHostname.test(value) && !isIPv6.test(value))
    ) {
      return 'It should be a valid hostname, FQDN, IPv4 or uncompressed IPv6';
    }
  },
};
