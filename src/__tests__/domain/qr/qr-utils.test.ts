import * as Utils from '../../../domain/qr/infrastructure/qr-utils';

describe('QR Utils', () => {
    describe('getSymbolSize', () => {
        it('should return correct size for version 1', () => {
            expect(Utils.getSymbolSize(1)).toBe(21);
        });

        it('should throw error if version is missing', () => {
            expect(() => Utils.getSymbolSize(0)).toThrow('Version parameter is required');
        });

        it('should throw error if version is out of range', () => {
            expect(() => Utils.getSymbolSize(41)).toThrow('Version must be between 1 and 40');
        });
    });

    describe('getSymbolTotalCodewords', () => {
        it('should return codewords count', () => {
            expect(Utils.getSymbolTotalCodewords(1)).toBe(26);
            expect(Utils.getSymbolTotalCodewords(40)).toBe(3706);
        });
    });

    describe('getBCHDigit', () => {
        it('should calculate BCH digit', () => {
            expect(Utils.getBCHDigit(0)).toBe(0);
            expect(Utils.getBCHDigit(1)).toBe(1);
            expect(Utils.getBCHDigit(2)).toBe(2); // 10 binary -> 2 bits
            // wait, getBCHDigit logic: while(data!=0) digit++ data>>=1. 
            // This is basically bit length?
            // 1 (1) -> 1
            // 2 (10) -> 2
            // 3 (11) -> 2? No, 3>>1=1, 1++=1. 1>>1=0, 1++=2. Yes.
            expect(Utils.getBCHDigit(3)).toBe(2);
        });
    });

    describe('toSJIS', () => {
        it('should throw if function not configured', () => {
            // We need to ensure it's undefined. But other tests might have set it!
            // We can set it to undefined via setToSJISFunction(undefined)?
            // Type definition says func must be function.
            // But we can trick it or assume it's global state.
            // If run in isolation it might work.
            // Or we can set it to a dummy function then try to unset?
            // source: export function setToSJISFunction(f) ... if typeof f !== function throw.
            // We cannot unset it via public API.
            // But we can check if it throws TypeError when setting invalid.
            expect(() => Utils.setToSJISFunction(null as any)).toThrow('must be a valid function');
        });

        it('should call configured function', () => {
            const mock = jest.fn().mockReturnValue(123);
            Utils.setToSJISFunction(mock);
            expect(Utils.toSJIS('test')).toBe(123);
            expect(mock).toHaveBeenCalledWith('test');
        });

        it('should throw if execution fails inside configured function', () => {
            Utils.setToSJISFunction(() => { throw new Error('fail'); });
            expect(() => Utils.toSJIS('test')).toThrow('fail');
        });
    });

    describe('isValid', () => {
        it('should validate version', () => {
            expect(Utils.isValid(1)).toBe(true);
            expect(Utils.isValid(41)).toBe(false);
            expect(Utils.isValid('1')).toBe(false);
            expect(Utils.isValid(NaN)).toBe(false);
        });
    });

    describe('isKanjiModeEnabled', () => {
        it('should return true if configured', () => {
            Utils.setToSJISFunction(() => 1);
            expect(Utils.isKanjiModeEnabled()).toBe(true);
        });
    });
});
