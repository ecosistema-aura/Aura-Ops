import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-3">
      <!-- Aura Landing Logo Icon / Card -->
      <div class="relative h-9 px-2 rounded-lg bg-white flex items-center justify-center shadow-sm overflow-hidden shrink-0 border border-slate-200">
        <img 
          src="/logo_aura.jpg" 
          alt="Aura Corporativa" 
          class="h-6 w-auto object-contain"
        />
      </div>

      <!-- Wordmark / Subsystem identifier -->
      @if (showWordmark) {
        <div class="flex flex-col">
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-bold px-2 py-0.5 rounded bg-[#DC2626]/20 text-[#F87171] border border-[#DC2626]/40 font-mono tracking-widest uppercase">
              OPS
            </span>
            <span class="text-[11px] font-semibold text-slate-200">Gestión</span>
          </div>
          <span class="text-[10px] text-slate-400 font-medium">Ecosistema Aura</span>
        </div>
      }
    </div>
  `
})
export class LogoComponent {
  @Input() showWordmark = true;
}
