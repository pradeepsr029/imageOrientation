import { TestBed } from '@angular/core/testing';

import { ImageOrientationService } from './image-orientation.service';

describe('ImageOrientationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ImageOrientationService = TestBed.get(ImageOrientationService);
    expect(service).toBeTruthy();
  });
});
