import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingComponent } from './loading.component';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default size to md', () => {
    expect(component.size).toBe('md');
  });

  it('should apply loading-md class by default', () => {
    const el: HTMLElement = fixture.nativeElement;
    const loadingDiv = el.querySelector('.loading');
    expect(loadingDiv?.classList.contains('loading-md')).toBe(true);
  });

  it('should apply loading-sm class when size is sm', () => {
    fixture = TestBed.createComponent(LoadingComponent);
    fixture.componentInstance.size = 'sm';
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const loadingDiv = el.querySelector('.loading');
    expect(loadingDiv?.classList.contains('loading-sm')).toBe(true);
  });

  it('should apply loading-lg class when size is lg', () => {
    fixture = TestBed.createComponent(LoadingComponent);
    fixture.componentInstance.size = 'lg';
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const loadingDiv = el.querySelector('.loading');
    expect(loadingDiv?.classList.contains('loading-lg')).toBe(true);
  });

  it('should contain a spinner element', () => {
    const el: HTMLElement = fixture.nativeElement;
    const spinner = el.querySelector('.spinner');
    expect(spinner).toBeTruthy();
  });

  it('should have spinner as child of loading div', () => {
    const el: HTMLElement = fixture.nativeElement;
    const loadingDiv = el.querySelector('.loading');
    const spinner = loadingDiv?.querySelector('.spinner');
    expect(spinner).toBeTruthy();
  });
});
