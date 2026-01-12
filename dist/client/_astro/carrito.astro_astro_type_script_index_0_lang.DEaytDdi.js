import{$ as f,a as b,u,r as x}from"./cart.BgO2WpaW.js";const l=50,p=4.99;function c(t){return new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"}).format(t)}function h(){const t=f.get(),r=b.get(),s=document.getElementById("cart-items"),i=document.getElementById("cart-empty");if(!(!s||!i)){if(t.length===0){s.classList.add("hidden"),i.classList.remove("hidden"),g(0);return}s.classList.remove("hidden"),i.classList.add("hidden"),s.innerHTML=t.map(e=>`
        <div class="flex gap-4 p-4 bg-card border border-border rounded-lg" data-item-id="${e.id}">
          <a href="/productos/${e.productSlug}" class="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-muted">
            <img src="${e.imageUrl}" alt="${e.productName}" class="w-full h-full object-cover">
          </a>
          
          <div class="flex-1 min-w-0">
            <a href="/productos/${e.productSlug}" class="font-medium hover:text-primary transition-colors line-clamp-1">
              ${e.productName}
            </a>
            <p class="text-sm text-muted-foreground">Talla: ${e.size}</p>
            <p class="font-bold mt-2">${c(e.price)}</p>
          </div>
          
          <div class="flex flex-col items-end gap-3">
            <div class="inline-flex items-center border border-border rounded-lg overflow-hidden">
              <button 
                class="qty-btn decrease w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                data-action="decrease"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
              <span class="w-12 text-center font-medium">${e.quantity}</span>
              <button 
                class="qty-btn increase w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                data-action="increase"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <button class="remove-btn text-sm text-muted-foreground hover:text-accent transition-colors">
              Eliminar
            </button>
          </div>
        </div>
      `).join(""),s.querySelectorAll("[data-item-id]").forEach(e=>{const n=e.getAttribute("data-item-id"),o=t.find(d=>d.id===n);e.querySelector(".decrease")?.addEventListener("click",()=>{u(n,o.quantity-1)}),e.querySelector(".increase")?.addEventListener("click",()=>{u(n,o.quantity+1)}),e.querySelector(".remove-btn")?.addEventListener("click",()=>{x(n)})}),g(r)}}function g(t){const r=t>=l,i=t+(r?0:p),e=Math.min(t/l*100,100),n=document.getElementById("subtotal"),o=document.getElementById("shipping"),d=document.getElementById("total"),m=document.getElementById("shipping-bar"),a=document.getElementById("shipping-message");if(n&&(n.textContent=c(t)),o&&(o.textContent=r?"GRATIS":c(p),o.className=r?"text-emerald-400 font-medium":""),d&&(d.textContent=c(i)),m&&(m.style.width=`${e}%`),a)if(r)a.textContent="🎉 ¡Tienes envío GRATIS!",a.className="text-sm text-emerald-400 font-medium mb-2";else{const v=l-t;a.textContent=`Añade ${c(v)} más para envío GRATIS`,a.className="text-sm text-muted-foreground mb-2"}}h();f.subscribe(()=>h());
