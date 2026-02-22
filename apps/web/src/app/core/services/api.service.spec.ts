import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    it('should send GET request to the correct URL', () => {
      const testData = { id: '1', name: 'Test' };

      service.get<typeof testData>('/users/1').subscribe((data) => {
        expect(data).toEqual(testData);
      });

      const req = httpMock.expectOne(`${baseUrl}/users/1`);
      expect(req.request.method).toBe('GET');
      req.flush(testData);
    });

    it('should handle empty response', () => {
      service.get('/empty').subscribe((data) => {
        expect(data).toBeNull();
      });

      const req = httpMock.expectOne(`${baseUrl}/empty`);
      req.flush(null);
    });

    it('should propagate HTTP errors', () => {
      service.get('/not-found').subscribe({
        error: (err) => {
          expect(err.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/not-found`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('post', () => {
    it('should send POST request with body', () => {
      const body = { email: 'test@test.com', password: '123' };
      const response = { access_token: 'abc' };

      service.post<typeof response>('/auth/login', body).subscribe((data) => {
        expect(data).toEqual(response);
      });

      const req = httpMock.expectOne(`${baseUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush(response);
    });

    it('should send POST request with empty body by default', () => {
      service.post('/action').subscribe();

      const req = httpMock.expectOne(`${baseUrl}/action`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush({});
    });
  });

  describe('patch', () => {
    it('should send PATCH request with body', () => {
      const body = { name: 'Updated' };
      const response = { id: '1', name: 'Updated' };

      service.patch<typeof response>('/users/1', body).subscribe((data) => {
        expect(data).toEqual(response);
      });

      const req = httpMock.expectOne(`${baseUrl}/users/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(body);
      req.flush(response);
    });

    it('should send PATCH request with empty body by default', () => {
      service.patch('/users/1').subscribe();

      const req = httpMock.expectOne(`${baseUrl}/users/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush({});
    });
  });

  describe('delete', () => {
    it('should send DELETE request to the correct URL', () => {
      service.delete('/users/1').subscribe((data) => {
        expect(data).toEqual({});
      });

      const req = httpMock.expectOne(`${baseUrl}/users/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('should propagate HTTP errors on delete', () => {
      service.delete('/users/999').subscribe({
        error: (err) => {
          expect(err.status).toBe(403);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/users/999`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });
});
