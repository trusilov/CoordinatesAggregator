const translations = {
  uk: {
    process: 'Обробити',
    clear: 'Очистити',
    mapPreview: 'Попередній перегляд мапи',
    points: 'Крапки',
    heatmap: 'Теплова мапа',
    satellite: 'Сателіт',
    darkMap: 'Темна',

    downloadResult: 'Завантажити результат',
    downloadConverted: 'Завантажити CSV',
    downloadErrors: 'Завантажити файл з помилками',

    ready: '● READY',
    processing: '● PROCESSING',
    errorStatus: '● ERROR',

    fileLoaded: 'Файл завантажено',
    chooseFileFirst: 'Спочатку вибери CSV або Excel файл',
    processingFile: 'Обробка файлу...',
    readingData: 'Читання даних...',
    validationFailed: 'Виявлено помилки у файлі',
    validationFileReady: 'Згенеровано файл з підсвіченими помилками',
    errorsFound: 'Знайдено помилок',

    done: 'Готово',
    error: 'Помилка',

    totalRows: 'Зчитано рядків',
    validRows: 'Валідних рядків',
    uniqueRows: 'Унікальних координат',
    convertedRows: 'Конвертовано',
    failedRows: 'Не сконвертовано',
    invalidValues: 'Невалідні value',
    invalidMgrs: 'Невалідні MGRS',
    duplicatesMerged: 'Дублікатів обʼєднано',

    value: 'Value',
    normalized: 'Нормалізовано',
    failedCoordinates: 'Не сконвертовані координати',

    unsupportedFile: 'Непідтримуваний формат файлу',
    excelNoSheets: 'Excel файл не містить листів',
    excelReadError: 'Не вдалося прочитати Excel файл',

    valueEmpty: 'Value не заповнено',
    valueIntegerOnly: 'Value має бути тільки цілим числом',
    mgrsDigitsError: 'MGRS має містити рівно 10 цифр після зони та квадрата',
    invalidCoordinateStructure: 'Невалідна структура координати',
    invalidCoordinateValues: 'Координати містять некоректні значення',
    unknownError: 'Невідома помилка',
    mgrsWrongDigits: 'Неправильна кількість цифр у MGRS координаті',
    mgrsInvalidZone: 'Некоректна зона MGRS',
    conversionError: 'Помилка конвертації координати',

    rowColumn: 'ROW',
    errorColumn: 'ERROR'
  },

  en: {
    process: 'Process',
    clear: 'Clear',
    mapPreview: 'Map preview',
    points: 'Points',
    heatmap: 'Heatmap',
    satellite: 'Satellite',
    darkMap: 'Dark',

    downloadResult: 'Download result',
    downloadConverted: 'Download CSV',
    downloadErrors: 'Download file with errors',

    ready: '● READY',
    processing: '● PROCESSING',
    errorStatus: '● ERROR',

    fileLoaded: 'File loaded',
    chooseFileFirst: 'Choose CSV or Excel file first',
    processingFile: 'Processing file...',
    readingData: 'Reading data...',
    validationFailed: 'Validation errors detected',
    validationFileReady: 'Generated file with highlighted errors',
    errorsFound: 'Errors found',

    done: 'Done',
    error: 'Error',

    totalRows: 'Rows read',
    validRows: 'Valid rows',
    uniqueRows: 'Unique coordinates',
    convertedRows: 'Converted',
    failedRows: 'Not converted',
    invalidValues: 'Invalid values',
    invalidMgrs: 'Invalid MGRS',
    duplicatesMerged: 'Duplicates merged',

    value: 'Value',
    normalized: 'Normalized',
    failedCoordinates: 'Failed coordinates',

    unsupportedFile: 'Unsupported file format',
    excelNoSheets: 'Excel file does not contain sheets',
    excelReadError: 'Failed to read Excel file',

    valueEmpty: 'Value is empty',
    valueIntegerOnly: 'Value must be an integer only',
    mgrsDigitsError: 'MGRS must contain exactly 10 digits after zone and grid square',
    invalidCoordinateStructure: 'Invalid coordinate structure',
    invalidCoordinateValues: 'Coordinates contain invalid values',
    unknownError: 'Unknown error',
    mgrsWrongDigits: 'Wrong number of digits in MGRS coordinate',
    mgrsInvalidZone: 'Invalid MGRS zone',
    conversionError: 'Coordinate conversion error',

    rowColumn: 'ROW',
    errorColumn: 'ERROR'
  }
};

function t(key) {
  return translations[state.currentLang][key] || key;
}