/**
 * apiService.test.tsx
 * Description: Unit tests for apiService HTTP helpers (GET, POST, PUT, PATCH, DELETE) using Vitest. Mocks Axios instance methods and validates returned data, multipart headers handling, error propagation, and global response interceptor behavior.
 * Authors: Original Moncarca team
 * Last Modification made:
 * 25/02/2026 [Jin Sik Yoon] Added detailed comments and documentation for clarity and maintainability.
 */

/* __tests__/utils/apiService.test.ts */
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import {
  getRequest,
  postRequest,
  putRequest,
  patchRequest,
  deleteRequest,
} from '../../utils/apiService';

/* ═════════════ Axios mocks (default) ═════════════
 * This section mocks Axios globally to:
 * - Prevent real HTTP requests in unit tests.
 * - Capture how apiService calls axios.* methods.
 * - Capture the response interceptor error handler for direct testing.
 */
var axiosGet: Mock, axiosPost: Mock, axiosPut: Mock, axiosPatch: Mock, axiosDelete: Mock;
/**
 * respInterceptorError stores the interceptor error callback registered by apiService.
 * This allows testing that the interceptor always rejects and handles multiple error shapes.
 */
let respInterceptorError: any;

vi.mock('axios', () => {
  axiosGet    = vi.fn();
  axiosPost   = vi.fn();
  axiosPut    = vi.fn();
  axiosPatch  = vi.fn();
  axiosDelete = vi.fn();

  /**
   * use captures the interceptor handlers.
   * Input:
   * - _succ: success handler (unused in these tests).
   * - err: error handler (stored for testing).
   * Output: void
   */
  const use = vi.fn((_succ, err) => {
    respInterceptorError = err;
  });

  /**
   * instance simulates an Axios instance returned by axios.create().
   * It includes HTTP methods and the response interceptor stub.
   */
  const instance = {
    get: axiosGet,
    post: axiosPost,
    put: axiosPut,
    patch: axiosPatch,
    delete: axiosDelete,
    interceptors: { response: { use } },
  };

  /**
   * create returns the mocked Axios instance.
   * This matches the way apiService builds its internal axios instance.
   */
  const create = vi.fn(() => instance);

  return { default: { create, ...instance }, create, ...instance };
});

/* ═════════════ Dummy data ═════════════
 * Used as the response payload returned by axios mocks.
 */
const dummyData = { ok: true };

/* ═════════════ Tests ═════════════ */
describe('apiService - full coverage', () => {
  /**
   * beforeEach resets mock call history so each test is isolated.
   * Input: None.
   * Output: void
   */
  beforeEach(() => vi.clearAllMocks());

  /* ---------- GET ---------- */
  it('getRequest returns data', async () => {
    axiosGet.mockResolvedValueOnce({ data: dummyData });
    const data = await getRequest('/foo', { q: 1 });
    expect(axiosGet).toHaveBeenCalledWith('/foo', { params: { q: 1 } });
    expect(data).toEqual(dummyData);
  });

  /* ---------- POST ---------- */
  it('postRequest JSON vs FormData', async () => {
    axiosPost.mockResolvedValue({ data: dummyData });

    await postRequest('/json', { a: 1 });
    const fd = new FormData(); fd.append('f', '1');
    await postRequest('/form', fd);

    const cfgJson = (axiosPost.mock.calls[0] as any[])[2];
    const cfgForm = (axiosPost.mock.calls[1] as any[])[2];

    expect(cfgJson.headers?.['Content-Type']).toBeUndefined();
    expect(cfgForm.headers?.['Content-Type']).toBe('multipart/form-data');
  });

  it('postRequest propagates errors', async () => {
    axiosPost.mockRejectedValueOnce(new Error('boom'));
    await expect(postRequest('/fail', {})).rejects.toThrow("boom");
  });

  /* ---------- PUT ---------- */
  it('putRequest sets headers correctly for JSON vs FormData', async () => {
    axiosPut.mockResolvedValue({ data: dummyData });

    await putRequest('/json', { a: 1 });
    const fd = new FormData(); fd.append('x', '1');
    await putRequest('/form', fd);

    const cfgJson = (axiosPut.mock.calls[0] as any[])[2];
    const cfgForm = (axiosPut.mock.calls[1] as any[])[2];

    expect(cfgJson.headers?.['Content-Type']).toBeUndefined();
    expect(cfgForm.headers?.['Content-Type']).toBe('multipart/form-data');
  });

  /* ---------- PATCH ---------- */
  it('patchRequest sets headers correctly for JSON vs FormData', async () => {
    axiosPatch.mockResolvedValue({ data: dummyData });

    await patchRequest('/json', { a: 1 });
    const fd = new FormData(); fd.append('y', '1');
    await patchRequest('/form', fd);

    const cfgJson = (axiosPatch.mock.calls[0] as any[])[2];
    const cfgForm = (axiosPatch.mock.calls[1] as any[])[2];

    expect(cfgJson.headers?.['Content-Type']).toBeUndefined();
    expect(cfgForm.headers?.['Content-Type']).toBe('multipart/form-data');
  });

  it('patchRequest propagates errors', async () => {
    axiosPatch.mockRejectedValueOnce(new Error('bad'));
    await expect(patchRequest('/bad', {})).rejects.toThrow('bad');
  });

  /* ---------- DELETE ---------- */
  it('deleteRequest handles success and error cases', async () => {
    axiosDelete.mockResolvedValueOnce({ data: dummyData });
    const data = await deleteRequest('/del/1');
    expect(data).toEqual(dummyData);

    axiosDelete.mockRejectedValueOnce(new Error('fail'));
    await expect(deleteRequest('/del/2')).rejects.toThrow('fail');
  });

  /* ---------- Interceptor ---------- */
  it('response interceptor always rejects and propagates errors', async () => {
    await expect(respInterceptorError({ response: { status: 401 } })).rejects.toBeDefined();
    await expect(respInterceptorError({ request: {} })).rejects.toBeDefined();
    await expect(respInterceptorError({ message: 'boom' })).rejects.toBeDefined();
  });
});
