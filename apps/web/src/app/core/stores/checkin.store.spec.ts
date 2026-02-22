import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CheckInStore } from './checkin.store';
import { ApiService } from '../services/api.service';
import { environment } from '../../../../environments/environment';

describe('CheckInStore', () => {
  let store: InstanceType<typeof CheckInStore>;
  let httpMock: HttpTestingController;

  const mockCheckIns = [
    { id: 'ci-1', mood: 8, energy: 7, notes: 'Good day', createdAt: '2026-02-15T10:00:00Z' },
    { id: 'ci-2', mood: 6, energy: 5, notes: 'OK day', createdAt: '2026-02-14T10:00:00Z' },
    { id: 'ci-3', mood: 4, energy: 3, notes: 'Tough day', createdAt: '2026-02-13T10:00:00Z' },
  ];

  const mockStats = {
    totalConversations: 5,
    totalCheckIns: 10,
    averageMood: 7.2,
    averageEnergy: 6.5,
    currentStreak: 3,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CheckInStore, ApiService],
    });

    store = TestBed.inject(CheckInStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(store).toBeDefined();
  });

  describe('initial state', () => {
    it('should have empty checkIns', () => {
      expect(store.checkIns()).toEqual([]);
    });

    it('should have null stats', () => {
      expect(store.stats()).toBeNull();
    });

    it('should not be loading', () => {
      expect(store.loading()).toBe(false);
    });

    it('should have no error', () => {
      expect(store.error()).toBeNull();
    });
  });

  describe('computed signals', () => {
    it('recentCheckIns should return first 5 items', () => {
      expect(store.recentCheckIns()).toEqual([]);
    });

    it('averageMood should be 0 when no stats', () => {
      expect(store.averageMood()).toBe(0);
    });

    it('totalCheckIns should be 0 when no stats', () => {
      expect(store.totalCheckIns()).toBe(0);
    });

    it('currentStreak should be 0 when no stats', () => {
      expect(store.currentStreak()).toBe(0);
    });

    it('chartData should return empty arrays when no data', () => {
      const chartData = store.chartData();
      expect(chartData.labels).toEqual([]);
      expect(chartData.mood).toEqual([]);
      expect(chartData.energy).toEqual([]);
    });
  });

  describe('loadCheckIns', () => {
    it('should load check-ins from API', async () => {
      const loadPromise = store.loadCheckIns();

      const req = httpMock.expectOne(`${environment.apiUrl}/checkins`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockCheckIns });

      await loadPromise;

      expect(store.checkIns()).toEqual(mockCheckIns);
      expect(store.loading()).toBe(false);
    });

    it('should set error on failure', async () => {
      const loadPromise = store.loadCheckIns();

      const req = httpMock.expectOne(`${environment.apiUrl}/checkins`);
      req.flush({ message: 'Server Error' }, { status: 500, statusText: 'Server Error' });

      await loadPromise;

      expect(store.error()).toBeTruthy();
      expect(store.loading()).toBe(false);
    });

    it('should update recentCheckIns after loading', async () => {
      const loadPromise = store.loadCheckIns();

      const req = httpMock.expectOne(`${environment.apiUrl}/checkins`);
      req.flush({ data: mockCheckIns });

      await loadPromise;

      expect(store.recentCheckIns().length).toBe(3);
    });
  });

  describe('createCheckIn', () => {
    it('should create check-in and add to list', async () => {
      const newCheckIn = { id: 'ci-new', mood: 9, energy: 8, notes: 'Great', createdAt: '2026-02-16T10:00:00Z' };
      const createPromise = store.createCheckIn({ mood: 9, energy: 8, notes: 'Great' });

      const req = httpMock.expectOne(`${environment.apiUrl}/checkins`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ mood: 9, energy: 8, notes: 'Great' });
      req.flush(newCheckIn);

      const result = await createPromise;

      expect(result).toEqual(newCheckIn);
      expect(store.checkIns()[0]).toEqual(newCheckIn);
    });

    it('should return null on failure', async () => {
      const createPromise = store.createCheckIn({ mood: 5, energy: 5 });

      const req = httpMock.expectOne(`${environment.apiUrl}/checkins`);
      req.flush({ message: 'Error' }, { status: 400, statusText: 'Bad Request' });

      const result = await createPromise;

      expect(result).toBeNull();
      expect(store.error()).toBeTruthy();
    });
  });

  describe('loadStats', () => {
    it('should load stats from API', async () => {
      const loadPromise = store.loadStats();

      const req = httpMock.expectOne(`${environment.apiUrl}/checkins/stats`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);

      await loadPromise;

      expect(store.stats()).toEqual(mockStats);
      expect(store.averageMood()).toBe(7.2);
      expect(store.totalCheckIns()).toBe(10);
      expect(store.currentStreak()).toBe(3);
    });

    it('should set error on failure', async () => {
      const loadPromise = store.loadStats();

      const req = httpMock.expectOne(`${environment.apiUrl}/checkins/stats`);
      req.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });

      await loadPromise;

      expect(store.error()).toBeTruthy();
    });
  });

  describe('chartData computed', () => {
    it('should generate chart data from check-ins', async () => {
      const loadPromise = store.loadCheckIns();

      const req = httpMock.expectOne(`${environment.apiUrl}/checkins`);
      req.flush({ data: mockCheckIns });

      await loadPromise;

      const chartData = store.chartData();
      // chartData reverses sliced data, so order matches chronological
      expect(chartData.labels.length).toBe(3);
      expect(chartData.mood.length).toBe(3);
      expect(chartData.energy.length).toBe(3);
      // Reversed order: oldest first
      expect(chartData.mood[0]).toBe(4); // ci-3 (oldest)
      expect(chartData.mood[2]).toBe(8); // ci-1 (newest)
    });
  });
});
