import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const source = readFileSync(join(process.cwd(), 'client/src/pages/Account.tsx'), 'utf8');

describe('Account return request contracts', () => {
  it('exposes request-return actions from order details', () => {
    expect(source).toContain('REQUEST RETURN');
    expect(source).toContain('VIEW RETURN STATUS');
    expect(source).toContain('openReturnRequest(order)');
  });

  it('provides a validated reason field and constrained image upload', () => {
    expect(source).toContain('data-testid="request-return-form"');
    expect(source).toContain('id="return-reason"');
    expect(source).toContain('Please select a reason for your return.');
    expect(source).toContain('accept="image/*"');
    expect(source).toContain('up to 3 image files, 5 MB each');
    expect(source).toContain('Please choose image files only.');
    expect(source).toContain('Each photo must be smaller than 5 MB.');
  });

  it('persists a submitted request and gives the customer feedback', () => {
    expect(source).toContain("const RETURN_REQUESTS_KEY = 'averae-return-requests'");
    expect(source).toContain('writeStoredJson(RETURN_REQUESTS_KEY, next)');
    expect(source).toContain("notifySaved('Return request received')");
    expect(source).toContain("trackEngagement('return_request_submitted'");
  });

  it('renders a visual status timeline with customer-safe states', () => {
    expect(source).toContain('Request received');
    expect(source).toContain('Under review');
    expect(source).toContain('Return approved');
    expect(source).toContain('Refund issued');
    expect(source).toContain('aria-label={`Return status for ${orderNumber}`}');
    expect(source).toContain('renderReturnTimeline(order.number)');
  });
});

