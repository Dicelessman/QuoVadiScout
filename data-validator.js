// data-validator.js
// Sistema di validazione avanzata per i dati QuoVadiScout

class DataValidator {
  constructor() {
    this.schemas = {
      struttura: {
        Struttura: { type: 'string', required: true, maxLength: 100, minLength: 2 },
        Luogo: { type: 'string', required: true, maxLength: 100, minLength: 2 },
        Provincia: { type: 'string', required: true, maxLength: 50, pattern: /^[A-Z]{2}$/ },
        Info: { type: 'string', required: false, maxLength: 1000 },
        Referente: { type: 'string', required: false, maxLength: 100 },
        Email: { type: 'email', required: false, maxLength: 254 },
        Sito: { type: 'url', required: false, maxLength: 200 },
        Contatto: { type: 'phone', required: false, maxLength: 50 },
        Letti: { type: 'number', required: false, min: 0, max: 1000 },
        Branco: { type: 'number', required: false, min: 0, max: 1000 },
        Reparto: { type: 'number', required: false, min: 0, max: 1000 },
        Compagnia: { type: 'number', required: false, min: 0, max: 1000 }
      },
      user: {
        uid: { type: 'string', required: true, pattern: /^[a-zA-Z0-9_-]+$/ },
        email: { type: 'email', required: true, maxLength: 254 },
        displayName: { type: 'string', required: false, maxLength: 100 },
        photoURL: { type: 'url', required: false, maxLength: 500 }
      },
      activity: {
        type: { type: 'string', required: true, enum: ['create', 'update', 'delete', 'view'] },
        userId: { type: 'string', required: true, pattern: /^[a-zA-Z0-9_-]+$/ },
        timestamp: { type: 'number', required: true, min: 0 },
        details: { type: 'object', required: false }
      }
    };

    this.customValidators = {
      email: this.validateEmail.bind(this),
      url: this.validateUrl.bind(this),
      phone: this.validatePhone.bind(this),
      number: this.validateNumber.bind(this)
    };

    this.init();
  }

  init() {
    console.log('🔍 Data Validator inizializzato');
  }

  // Valida dati secondo schema
  validate(data, schemaName) {
    const schema = this.schemas[schemaName];
    if (!schema) {
      throw new Error(`Schema non trovato: ${schemaName}`);
    }

    const errors = [];
    const sanitizedData = {};

    // Valida ogni campo
    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
      const value = data[fieldName];
      
      // Controlla se il campo è richiesto
      if (fieldSchema.required && (value === undefined || value === null || value === '')) {
        errors.push(`Campo obbligatorio mancante: ${fieldName}`);
        continue;
      }

      // Se il valore è vuoto e non richiesto, salta la validazione
      if (!fieldSchema.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Valida tipo
      const typeError = this.validateType(value, fieldSchema.type, fieldName);
      if (typeError) {
        errors.push(typeError);
        continue;
      }

      // Valida lunghezza
      const lengthError = this.validateLength(value, fieldSchema, fieldName);
      if (lengthError) {
        errors.push(lengthError);
        continue;
      }

      // Valida pattern
      const patternError = this.validatePattern(value, fieldSchema, fieldName);
      if (patternError) {
        errors.push(patternError);
        continue;
      }

      // Valida range numerico
      const rangeError = this.validateRange(value, fieldSchema, fieldName);
      if (rangeError) {
        errors.push(rangeError);
        continue;
      }

      // Valida enum
      const enumError = this.validateEnum(value, fieldSchema, fieldName);
      if (enumError) {
        errors.push(enumError);
        continue;
      }

      // Sanitizza valore
      const sanitizedValue = this.sanitizeValue(value, fieldSchema.type);
      sanitizedData[fieldName] = sanitizedValue;
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: sanitizedData
    };
  }

  // Valida tipo di dato
  validateType(value, expectedType, fieldName) {
    switch (expectedType) {
      case 'string':
        if (typeof value !== 'string') {
          return `Campo ${fieldName} deve essere una stringa`;
        }
        break;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return `Campo ${fieldName} deve essere un numero`;
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          return `Campo ${fieldName} deve essere un booleano`;
        }
        break;
      case 'object':
        if (typeof value !== 'object' || value === null) {
          return `Campo ${fieldName} deve essere un oggetto`;
        }
        break;
      case 'array':
        if (!Array.isArray(value)) {
          return `Campo ${fieldName} deve essere un array`;
        }
        break;
      case 'email':
        if (!this.validateEmail(value)) {
          return `Campo ${fieldName} deve essere un email valido`;
        }
        break;
      case 'url':
        if (!this.validateUrl(value)) {
          return `Campo ${fieldName} deve essere un URL valido`;
        }
        break;
      case 'phone':
        if (!this.validatePhone(value)) {
          return `Campo ${fieldName} deve essere un numero di telefono valido`;
        }
        break;
    }
    return null;
  }

  // Valida lunghezza
  validateLength(value, fieldSchema, fieldName) {
    if (typeof value === 'string') {
      if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
        return `Campo ${fieldName} deve essere lungo almeno ${fieldSchema.minLength} caratteri`;
      }
      if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
        return `Campo ${fieldName} deve essere lungo al massimo ${fieldSchema.maxLength} caratteri`;
      }
    }
    return null;
  }

  // Valida pattern
  validatePattern(value, fieldSchema, fieldName) {
    if (fieldSchema.pattern && typeof value === 'string') {
      if (!fieldSchema.pattern.test(value)) {
        return `Campo ${fieldName} non corrisponde al formato richiesto`;
      }
    }
    return null;
  }

  // Valida range numerico
  validateRange(value, fieldSchema, fieldName) {
    if (typeof value === 'number') {
      if (fieldSchema.min !== undefined && value < fieldSchema.min) {
        return `Campo ${fieldName} deve essere almeno ${fieldSchema.min}`;
      }
      if (fieldSchema.max !== undefined && value > fieldSchema.max) {
        return `Campo ${fieldName} deve essere al massimo ${fieldSchema.max}`;
      }
    }
    return null;
  }

  // Valida enum
  validateEnum(value, fieldSchema, fieldName) {
    if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
      return `Campo ${fieldName} deve essere uno dei valori: ${fieldSchema.enum.join(', ')}`;
    }
    return null;
  }

  // Sanitizza valore
  sanitizeValue(value, type) {
    switch (type) {
      case 'string':
        return this.sanitizeString(value);
      case 'email':
        return this.sanitizeEmail(value);
      case 'url':
        return this.sanitizeUrl(value);
      case 'phone':
        return this.sanitizePhone(value);
      case 'number':
        return this.sanitizeNumber(value);
      default:
        return value;
    }
  }

  // Sanitizza stringa
  sanitizeString(value) {
    if (typeof value !== 'string') return '';
    
    // Rimuovi tag HTML pericolosi
    let sanitized = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    
    // Escape caratteri speciali
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
    
    // Rimuovi caratteri di controllo
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
    
    return sanitized.trim();
  }

  // Sanitizza email
  sanitizeEmail(value) {
    if (typeof value !== 'string') return '';
    
    // Rimuovi spazi e converti in lowercase
    const sanitized = value.trim().toLowerCase();
    
    // Valida formato email
    if (!this.validateEmail(sanitized)) {
      return '';
    }
    
    return sanitized;
  }

  // Sanitizza URL
  sanitizeUrl(value) {
    if (typeof value !== 'string') return '';
    
    const sanitized = value.trim();
    
    // Aggiungi protocollo se mancante
    if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
      return 'https://' + sanitized;
    }
    
    // Valida URL
    if (!this.validateUrl(sanitized)) {
      return '';
    }
    
    return sanitized;
  }

  // Sanitizza telefono
  sanitizePhone(value) {
    if (typeof value !== 'string') return '';
    
    // Rimuovi caratteri non numerici eccetto +, -, (, ), spazi
    const sanitized = value.replace(/[^\d\+\-\(\)\s]/g, '');
    
    // Valida formato
    if (!this.validatePhone(sanitized)) {
      return '';
    }
    
    return sanitized;
  }

  // Sanitizza numero
  sanitizeNumber(value) {
    if (typeof value === 'number') {
      return isNaN(value) ? 0 : value;
    }
    
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    return 0;
  }

  // Validatori personalizzati
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  validateUrl(url) {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  validatePhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,20}$/;
    return phoneRegex.test(phone);
  }

  validateNumber(number) {
    return typeof number === 'number' && !isNaN(number) && isFinite(number);
  }

  // Aggiungi schema personalizzato
  addSchema(name, schema) {
    this.schemas[name] = schema;
    console.log(`📋 Schema aggiunto: ${name}`);
  }

  // Ottieni schema
  getSchema(name) {
    return this.schemas[name];
  }

  // Ottieni tutti gli schemi
  getAllSchemas() {
    return { ...this.schemas };
  }

  // Valida dati in batch
  validateBatch(dataArray, schemaName) {
    const results = [];
    
    for (const data of dataArray) {
      const result = this.validate(data, schemaName);
      results.push(result);
    }
    
    return results;
  }

  // Genera report validazione
  generateValidationReport(validationResults) {
    const report = {
      total: validationResults.length,
      valid: 0,
      invalid: 0,
      errors: {},
      recommendations: []
    };

    for (const result of validationResults) {
      if (result.isValid) {
        report.valid++;
      } else {
        report.invalid++;
        
        for (const error of result.errors) {
          const errorType = error.split(':')[0];
          report.errors[errorType] = (report.errors[errorType] || 0) + 1;
        }
      }
    }

    // Genera raccomandazioni
    if (report.errors['Campo obbligatorio mancante'] > 0) {
      report.recommendations.push('Verificare che tutti i campi obbligatori siano compilati');
    }

    if (report.errors['Campo'] && report.errors['Campo'].includes('lunghezza')) {
      report.recommendations.push('Controllare la lunghezza dei campi di testo');
    }

    if (report.errors['Campo'] && report.errors['Campo'].includes('formato')) {
      report.recommendations.push('Verificare il formato dei campi (email, URL, telefono)');
    }

    return report;
  }
}

// Inizializza Data Validator
window.dataValidator = new DataValidator();

console.log('🔍 Data Validator caricato e attivo');
