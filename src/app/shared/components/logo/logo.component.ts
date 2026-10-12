import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-3">
      <!-- Aura Mini Official Icon -->
      <img 
        src="/logo_aura_mini.jpg" 
        alt="Aura" 
        class="w-10 h-10 rounded-xl object-cover shadow-sm ring-1 ring-white/10 shrink-0"
      />

      <!-- Wordmark / Subsystem identifier -->
      @if (showWordmark) {
        <div class="flex flex-col">
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-base tracking-tight text-white font-sans">AURA</span>
            <span class="text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#DC2626]/25 text-[#F87171] border border-[#DC2626]/40 font-mono tracking-wider">
              OPS
            </span>
          </div>
          <span class="text-[11px] text-slate-400 font-medium">Gestión de Operaciones</span>
        </div>
      }
    </div>
  `
})
export class LogoComponent {
  @Input() showWordmark = true;
}
