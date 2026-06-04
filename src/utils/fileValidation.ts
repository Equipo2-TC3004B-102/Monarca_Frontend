/**
 * FileName: fileValidation.ts
 * Description: Utility functions for file validation, including size limit enforcement.
 * Purpose: Centralized file validation logic reusable across all upload components.
 * Authors: Original Monarca team
 * Last Modification made:
 * 04/05/2026 [Santiago Coronado Hernández] Added file size validation for uploaded files and enhanced error handling to provide user-friendly messages when file size exceeds limits.
 */

/**
 * Maximum allowed file size in MB
 */
export const MAX_FILE_SIZE_MB = 5;

/**
 * Maximum allowed file size in bytes
 */
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * Checks if a file size is within the allowed limit.
 * Input: file (File object)
 * Output: boolean - true if file is valid size, false otherwise
 */
export const isFileSizeValid = (file: File): boolean => {
  return file.size <= MAX_FILE_SIZE_BYTES;
};

/**
 * Generates a localized error message for oversized files.
 * Input: fileName (string), fileSizeBytes (number)
 * Output: string - Error message in Spanish
 */
export const getFileSizeErrorMessage = (
  fileName: string,
  fileSizeBytes: number
): string => {
  const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);
  return `El archivo "${fileName}" es demasiado grande (${fileSizeMB} MB). El tamaño máximo permitido es ${MAX_FILE_SIZE_MB} MB.`;
};

/**
 * Validates a file against size and optionally other criteria.
 * Input: file (File), allowedExtensions (string[] - optional), allowedMimeTypes (string[] - optional)
 * Output: object { isValid: boolean, errorMessage?: string }
 */
export const validateFile = (
  file: File,
  allowedExtensions?: string[],
  allowedMimeTypes?: string[]
): { isValid: boolean; errorMessage?: string } => {
  // Check file size first
  if (!isFileSizeValid(file)) {
    return {
      isValid: false,
      errorMessage: getFileSizeErrorMessage(file.name, file.size),
    };
  }

  // Check file extension if provided
  if (allowedExtensions && allowedExtensions.length > 0) {
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        errorMessage: `Extensión de archivo no válida. Se permiten: ${allowedExtensions.join(", ")}`,
      };
    }
  }

  // Check MIME type if provided
  if (allowedMimeTypes && allowedMimeTypes.length > 0) {
    if (!allowedMimeTypes.includes(file.type)) {
      return {
        isValid: false,
        errorMessage: `Tipo de archivo no válido. Se permiten: ${allowedMimeTypes.join(", ")}`,
      };
    }
  }

  return { isValid: true };
};
