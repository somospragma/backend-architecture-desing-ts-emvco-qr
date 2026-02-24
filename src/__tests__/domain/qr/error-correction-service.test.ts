import { ErrorCorrectionService } from '../../../domain/qr/services/error-correction-service';

describe('ErrorCorrectionService', () => {
  it('should export ErrorCorrectionCode as ErrorCorrectionService', () => {
    expect(ErrorCorrectionService).toBeDefined();
    expect(typeof ErrorCorrectionService.getBlocksCount).toBe('function');
    expect(typeof ErrorCorrectionService.getTotalCodewordsCount).toBe('function');
  });
});
