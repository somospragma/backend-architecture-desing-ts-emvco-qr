# 🤝 Guía de Contribución - EMVCode

¡Gracias por tu interés en contribuir a EMVCode! Esta guía te ayudará a empezar.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Configuración del Entorno](#configuración-del-entorno)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Estándares de Código](#estándares-de-código)
- [Testing](#testing)
- [Documentación](#documentación)
- [Pull Requests](#pull-requests)

## 📜 Código de Conducta

Este proyecto sigue el [Contributor Covenant](https://www.contributor-covenant.org/). Al participar, se espera que mantengas este código.

## 🛠️ Configuración del Entorno

### Prerrequisitos

- Node.js 16+
- npm 8+
- Git

### Instalación

```bash
# Fork y clona el repositorio
git clone https://github.com/tu-usuario/emvcode.git
cd emvcode

# Instala dependencias
npm install

# Ejecuta tests para verificar
npm test
```

## 🔄 Flujo de Trabajo

### 1. Crear Issue

Antes de trabajar en una nueva feature:

- Revisa issues existentes
- Crea un nuevo issue describiendo el problema/feature
- Espera feedback del equipo

### 2. Crear Branch

```bash
# Actualiza main
git checkout main
git pull origin main

# Crea branch desde main
git checkout -b feature/nombre-descriptivo
# o
git checkout -b fix/descripcion-del-bug
```

### 3. Desarrollo

```bash
# Desarrollo iterativo
npm run dev

# Tests en watch mode
npm run test:watch

# Lint y format
npm run lint
npm run format
```

### 4. Commit

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add new EMV tag validation"
git commit -m "fix: resolve CRC calculation issue"
git commit -m "docs: update API documentation"
```

**Tipos de commit:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Formato de código
- `refactor`: Refactorización
- `test`: Tests
- `chore`: Tareas de mantenimiento

## 📏 Estándares de Código

### TypeScript

```typescript
// ✅ Correcto
interface EMVTag {
  readonly id: string;
  readonly value: string;
  readonly length: number;
}

class EMVBuilder {
  private readonly tags = new Map<string, string>();
  
  public setTag(id: string, value: string): this {
    this.validateTag(id, value);
    this.tags.set(id, value);
    return this;
  }
}

// ❌ Incorrecto
interface emvTag {
  id: string;
  value: string;
}

class emvBuilder {
  tags: any = {};
  
  setTag(id, value) {
    this.tags[id] = value;
    return this;
  }
}
```

### Reglas de Estilo

- **Naming**: PascalCase para clases, camelCase para variables/métodos
- **Imports**: Usar imports absolutos cuando sea posible
- **Exports**: Preferir named exports sobre default exports
- **Types**: Definir interfaces para todos los objetos públicos

### ESLint y Prettier

```bash
# Verificar estilo
npm run lint

# Corregir automáticamente
npm run lint:fix

# Formatear código
npm run format
```

## 🧪 Testing

### Estructura de Tests

```
tests/
├── unit/           # Tests unitarios
├── integration/    # Tests de integración
└── fixtures/       # Datos de prueba
```

### Escribir Tests

```typescript
// tests/unit/emv-builder.test.ts
describe('EMVBuilder', () => {
  let builder: EMVBuilder;

  beforeEach(() => {
    builder = new EMVBuilder();
  });

  describe('setTag', () => {
    it('should set a valid tag', () => {
      const result = builder.setTag('00', '01');
      
      expect(result).toBe(builder);
      expect(builder.getTag('00')).toBe('01');
    });

    it('should throw error for invalid tag', () => {
      expect(() => {
        builder.setTag('', '01');
      }).toThrow('Tag ID cannot be empty');
    });
  });
});
```

### Comandos de Testing

```bash
# Ejecutar todos los tests
npm test

# Tests con coverage
npm run test:coverage

# Tests específicos
npm test -- --testNamePattern="EMVBuilder"

# Tests en modo watch
npm run test:watch
```

### Cobertura Mínima

- **Líneas**: 90%
- **Funciones**: 95%
- **Branches**: 85%

## 📚 Documentación

### JSDoc

```typescript
/**
 * Construye un código QR EMVCo válido
 * @param options - Configuración del QR
 * @returns String del código QR con CRC
 * @throws {EMVError} Cuando los datos son inválidos
 * @example
 * ```typescript
 * const builder = new EMVBuilder();
 * const qr = builder
 *   .setTag('00', '01')
 *   .setTag('52', '5411')
 *   .build();
 * ```
 */
public build(options?: BuildOptions): string {
  // implementación
}
```

### README Updates

Si tu cambio afecta la API pública:

1. Actualiza ejemplos en README.md
2. Agrega nuevos métodos a la documentación
3. Incluye ejemplos de uso

## 🔍 Pull Requests

### Antes de Enviar

```bash
# Verifica que todo esté bien
npm run build
npm test
npm run lint
```

### Template de PR

```markdown
## 📝 Descripción

Breve descripción de los cambios realizados.

## 🔗 Issue Relacionado

Fixes #123

## 🧪 Testing

- [ ] Tests unitarios agregados/actualizados
- [ ] Tests de integración agregados/actualizados
- [ ] Cobertura de código mantenida

## 📚 Documentación

- [ ] README actualizado
- [ ] JSDoc agregado/actualizado
- [ ] Ejemplos incluidos

## ✅ Checklist

- [ ] Código sigue las convenciones del proyecto
- [ ] Tests pasan localmente
- [ ] Commits siguen Conventional Commits
- [ ] No hay conflictos con main
```

### Proceso de Review

1. **Automated Checks**: CI/CD debe pasar
2. **Code Review**: Al menos 1 aprobación requerida
3. **Testing**: Verificar que tests cubren los cambios
4. **Documentation**: Confirmar que docs están actualizadas

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios

```
src/
├── application/        # Casos de uso y builders
│   ├── builders/
│   └── services/
├── domain/            # Lógica de negocio
│   ├── emv/
│   ├── qr/
│   └── crypto/
├── infrastructure/    # Implementaciones externas
└── shared/           # Utilidades compartidas
```

### Principios de Diseño

- **Clean Architecture**: Separación clara de responsabilidades
- **SOLID**: Principios de diseño orientado a objetos
- **DRY**: No repetir código
- **YAGNI**: No implementar funcionalidad innecesaria

## 🐛 Reportar Bugs

### Template de Bug Report

```markdown
**Descripción del Bug**
Descripción clara del problema.

**Pasos para Reproducir**
1. Ejecutar '...'
2. Llamar método '...'
3. Ver error

**Comportamiento Esperado**
Lo que debería suceder.

**Comportamiento Actual**
Lo que realmente sucede.

**Entorno**
- OS: [e.g. Windows 11]
- Node.js: [e.g. 18.17.0]
- EMVCode: [e.g. 1.2.3]

**Código de Ejemplo**
```typescript
// Código que reproduce el bug
```

**Logs/Screenshots**
Si aplica, agrega logs o capturas.
```

## 💡 Solicitar Features

### Template de Feature Request

```markdown
**¿Tu feature request está relacionada con un problema?**
Descripción clara del problema.

**Describe la solución que te gustaría**
Descripción clara de lo que quieres que suceda.

**Describe alternativas que has considerado**
Otras soluciones o features que has considerado.

**Contexto adicional**
Cualquier otro contexto sobre la feature request.
```

## 🚀 Release Process

### Versionado

Seguimos [Semantic Versioning](https://semver.org/):

- **MAJOR**: Cambios incompatibles en la API
- **MINOR**: Nueva funcionalidad compatible
- **PATCH**: Correcciones de bugs compatibles

### Changelog

Mantener `CHANGELOG.md` actualizado:

```markdown
## [1.2.0] - 2024-01-15

### Added
- Nueva validación de tags EMV
- Soporte para QR estáticos

### Changed
- Mejorado rendimiento del CRC

### Fixed
- Corrección en cálculo de hash de seguridad
```


¡Gracias por contribuir a EMVCode! 🎉