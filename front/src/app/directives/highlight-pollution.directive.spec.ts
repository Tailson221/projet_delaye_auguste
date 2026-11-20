import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HighlightPollutionDirective } from './highlight-pollution.directive';
import { By } from '@angular/platform-browser';

@Component({
  standalone: true,
  imports: [HighlightPollutionDirective],
  template: `
    <div id="test-faible-num" [appHighlightPollution]="15">Faible Numérique</div>
    <div id="test-moderee-num" [appHighlightPollution]="45">Modérée Numérique</div>
    <div id="test-elevee-num" [appHighlightPollution]="80">Élevée Numérique</div>
    <div id="test-dangereuse-num" [appHighlightPollution]="150">Dangereuse Numérique</div>
    <div id="test-faible-str" [appHighlightPollution]="'Faible'">Faible Texte</div>
    <div id="test-moderee-str" [appHighlightPollution]="'Modérée'">Modérée Texte</div>
    <div id="test-elevee-str" [appHighlightPollution]="'Élevée'">Élevée Texte</div>
    <div id="test-dangereuse-str" [appHighlightPollution]="'Dangereuse'">Dangereuse Texte</div>
    <div id="test-alias" [highlightPollution]="120">Alias Dangereuse</div>
    <div id="test-empty" [appHighlightPollution]="null">Vide</div>
  `,
})
class TestHostComponent {}

describe('HighlightPollutionDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('devrait appliquer un fond vert clair pour une pollution Faible (<= 20 ou "Faible")', () => {
    const elNum = fixture.debugElement.query(By.css('#test-faible-num')).nativeElement as HTMLElement;
    const elStr = fixture.debugElement.query(By.css('#test-faible-str')).nativeElement as HTMLElement;

    expect(elNum.style.backgroundColor).toBe('rgb(209, 250, 229)'); // #d1fae5
    expect(elStr.style.backgroundColor).toBe('rgb(209, 250, 229)');
  });

  it('devrait appliquer un fond jaune pour une pollution Modérée (21-50 ou "Modérée")', () => {
    const elNum = fixture.debugElement.query(By.css('#test-moderee-num')).nativeElement as HTMLElement;
    const elStr = fixture.debugElement.query(By.css('#test-moderee-str')).nativeElement as HTMLElement;

    expect(elNum.style.backgroundColor).toBe('rgb(254, 240, 138)'); // #fef08a
    expect(elStr.style.backgroundColor).toBe('rgb(254, 240, 138)');
  });

  it('devrait appliquer un fond orange pour une pollution Élevée (51-100 ou "Élevée")', () => {
    const elNum = fixture.debugElement.query(By.css('#test-elevee-num')).nativeElement as HTMLElement;
    const elStr = fixture.debugElement.query(By.css('#test-elevee-str')).nativeElement as HTMLElement;

    expect(elNum.style.backgroundColor).toBe('rgb(254, 215, 170)'); // #fed7aa
    expect(elStr.style.backgroundColor).toBe('rgb(254, 215, 170)');
  });

  it('devrait appliquer un fond rouge pour une pollution Dangereuse (101+ ou "Dangereuse")', () => {
    const elNum = fixture.debugElement.query(By.css('#test-dangereuse-num')).nativeElement as HTMLElement;
    const elStr = fixture.debugElement.query(By.css('#test-dangereuse-str')).nativeElement as HTMLElement;
    const elAlias = fixture.debugElement.query(By.css('#test-alias')).nativeElement as HTMLElement;

    expect(elNum.style.backgroundColor).toBe('rgb(254, 202, 202)'); // #fecaca
    expect(elStr.style.backgroundColor).toBe('rgb(254, 202, 202)');
    expect(elAlias.style.backgroundColor).toBe('rgb(254, 202, 202)');
  });

  it('ne devrait appliquer aucun style si l\'indice est nul', () => {
    const elEmpty = fixture.debugElement.query(By.css('#test-empty')).nativeElement as HTMLElement;
    expect(elEmpty.style.backgroundColor).toBe('');
  });
});
