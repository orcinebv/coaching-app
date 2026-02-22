import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CheckinComponent } from './checkin.component';
import { CheckInStore } from '../../core/stores/checkin.store';
import { ApiService } from '../../core/services/api.service';

describe('CheckinComponent', () => {
  let component: CheckinComponent;
  let fixture: ComponentFixture<CheckinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckinComponent, HttpClientTestingModule],
      providers: [CheckInStore, ApiService],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckinComponent);
    component = fixture.componentInstance;
    // Don't call detectChanges yet to avoid ngOnInit HTTP call
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a checkin form', () => {
    expect(component.checkinForm).toBeDefined();
  });

  it('should have default form values', () => {
    expect(component.checkinForm.get('mood')?.value).toBe(5);
    expect(component.checkinForm.get('energy')?.value).toBe(5);
    expect(component.checkinForm.get('notes')?.value).toBe('');
    expect(component.checkinForm.get('goals')?.value).toBe('');
  });

  it('should not be submitting initially', () => {
    expect(component.isSubmitting).toBe(false);
  });

  it('should have empty success and error messages initially', () => {
    expect(component.successMessage).toBe('');
    expect(component.errorMessage).toBe('');
  });

  describe('getMoodEmoji', () => {
    it('should return sad emoji for low mood', () => {
      expect(component.getMoodEmoji(1)).toBe('\u{1F622}');
      expect(component.getMoodEmoji(2)).toBe('\u{1F622}');
    });

    it('should return confused emoji for mood 3-4', () => {
      expect(component.getMoodEmoji(3)).toBe('\u{1F615}');
      expect(component.getMoodEmoji(4)).toBe('\u{1F615}');
    });

    it('should return neutral emoji for mood 5-6', () => {
      expect(component.getMoodEmoji(5)).toBe('\u{1F610}');
      expect(component.getMoodEmoji(6)).toBe('\u{1F610}');
    });

    it('should return happy emoji for mood 7-8', () => {
      expect(component.getMoodEmoji(7)).toBe('\u{1F60A}');
      expect(component.getMoodEmoji(8)).toBe('\u{1F60A}');
    });

    it('should return very happy emoji for mood 9-10', () => {
      expect(component.getMoodEmoji(9)).toBe('\u{1F604}');
      expect(component.getMoodEmoji(10)).toBe('\u{1F604}');
    });
  });

  describe('getEnergyEmoji', () => {
    it('should return sleeping emoji for low energy', () => {
      expect(component.getEnergyEmoji(1)).toBe('\u{1F634}');
    });

    it('should return fire emoji for high energy', () => {
      expect(component.getEnergyEmoji(10)).toBe('\u{1F525}');
    });
  });

  describe('onSubmit', () => {
    it('should not submit when form is invalid', async () => {
      component.checkinForm.get('mood')?.setValue(null);
      component.checkinForm.get('mood')?.updateValueAndValidity();

      const createSpy = jest.spyOn(component.checkInStore, 'createCheckIn');
      await component.onSubmit();
      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  describe('form validation', () => {
    it('should require mood between 1 and 10', () => {
      component.checkinForm.get('mood')?.setValue(0);
      expect(component.checkinForm.get('mood')?.valid).toBe(false);

      component.checkinForm.get('mood')?.setValue(11);
      expect(component.checkinForm.get('mood')?.valid).toBe(false);

      component.checkinForm.get('mood')?.setValue(5);
      expect(component.checkinForm.get('mood')?.valid).toBe(true);
    });

    it('should require energy between 1 and 10', () => {
      component.checkinForm.get('energy')?.setValue(0);
      expect(component.checkinForm.get('energy')?.valid).toBe(false);

      component.checkinForm.get('energy')?.setValue(5);
      expect(component.checkinForm.get('energy')?.valid).toBe(true);
    });

    it('should allow optional notes', () => {
      component.checkinForm.get('notes')?.setValue('');
      expect(component.checkinForm.valid).toBe(true);

      component.checkinForm.get('notes')?.setValue('Some notes');
      expect(component.checkinForm.valid).toBe(true);
    });

    it('should allow optional goals', () => {
      component.checkinForm.get('goals')?.setValue('');
      expect(component.checkinForm.valid).toBe(true);
    });
  });
});
