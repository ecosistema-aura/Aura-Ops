import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-3">
      <!-- Aura Vector Logo Symbol -->
      <div class="relative w-8 h-8 rounded-lg bg-[#112238] border border-[#1E3756] flex items-center justify-center shadow-xs overflow-hidden shrink-0">
        <svg class="w-6 h-6" viewBox="0 0 120 120" fill="none">
          <!-- A-Chevron White -->
          <path d="M35 85L60 35L85 85H68L60 67L52 85H35Z" fill="#F8FAFC"/>
          <!-- Signature Aura Dynamic Crimson Arrow -->
          <path d="M72 32L95 32L95 55L86 46L76 56L68 48L78 38L72 32Z" fill="#E11D48"/>
        </svg>
      </div>

      <!-- Wordmark -->
      @if (showWordmark) {
        <div class="flex flex-col">
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-sm tracking-tight text-white font-sans">AURA</span>
            <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#E11D48]/15 text-[#FB7185] border border-[#E11D48]/30 font-mono tracking-wider">
              OPS
            </span>
          </div>
          <span class="text-[10px] text-slate-400 font-medium tracking-wide">Operaciones</span>
        </div>
      }
    </div>
  `
})
export class LogoComponent {
  @Input() showWordmark = true;
}
