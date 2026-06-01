// Central MTB Footer Include

(function(){

  // Inject footer styles
  var style = document.createElement('style');
  style.textContent = `
    .footer-treeline {
      display: block;
      line-height: 0;
      background: #C2282D;
      margin-top: -2px;
    }
    .footer-treeline img {
      display: block;
      width: 100%;
      height: auto;
    }
    .cta-final { padding-bottom: 20px !important; }
    .footer {
      border-top: none !important;
    }
    .footer__brand-link {
      display: inline-block;
      line-height: 0;
    }
    .footer__brand-link img {
      transition: transform 180ms cubic-bezier(0.16,1,0.3,1);
    }
    .footer__brand-link:hover img {
      transform: rotate(-3deg) scale(1.04);
    }
  `;
  document.head.appendChild(style);

  // Treeline transition
  var treeline = document.createElement('div');
  treeline.innerHTML = '<div class="footer-treeline" aria-hidden="true"><img src="/images/treeline.png" alt=""></div>';
  document.body.appendChild(treeline.firstElementChild);

  // Footer
  var footer = document.createElement('div');
  footer.innerHTML = `
<footer class="footer">
  <div class="footer__inner">
    <div>
      <div class="footer__brand">
        <a href="/" aria-label="Central MTB Home" class="footer__brand-link">
          <img src="/images/logo.png" alt="St. Paul Central Mountain Bike Team" width="127" height="240">
        </a>
        <p>Youth mountain biking for grades 6&ndash;12 in St. Paul, Minnesota. A volunteer-run program affiliated with the Minnesota Cycling Association.</p>
        <div class="footer__social">
          <a href="https://www.instagram.com/spcmtb_official" target="_blank" rel="noopener" aria-label="Central MTB on Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
          </a>
          <a href="https://www.tiktok.com/@centralmtb" target="_blank" rel="noopener" aria-label="Central MTB on TikTok">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>
          </a>
        </div>
      </div>
    </div>
    <div class="footer__col">
      <h4>Ride</h4>
      <ul>
        <li><a href="/parent-guide">Parent Guide</a></li>
        <li><a href="/equipment-guide">Equipment Guide</a></li>
        <li><a href="/lettering-criteria">Lettering Criteria</a></li>
      </ul>
    </div>
    <div class="footer__col">
      <h4>The Team</h4>
      <ul>
        <li><a href="/coach-bios">Coach Bios</a></li>
        <li><a href="/captain">Captain Application</a></li>
        <li><a href="/media">Media</a></li>
      </ul>
    </div>
    <div class="footer__col">
      <h4>Support</h4>
      <ul>
        <li><a href="/sponsor">Become a Sponsor</a></li>
        <li><a href="https://shop.centralmtb.com/">Shop</a></li>
        <li><a href="#" data-mail="hello">Contact</a></li>
      </ul>
    </div>
  </div>
  <div class="footer__bottom">
    <span>&copy; <span id="footer-year"></span> St. Paul Central Mountain Bike Team</span>
    <span>Built by riders &amp; parents. Powered by dirt.</span>
  </div>
</footer>`;

  document.body.appendChild(footer.firstElementChild);

  // Year
  var y = document.getElementById('footer-year');
  if (y) y.textContent = new Date().getFullYear();

  // Email hydration (Cloudflare-safe)
  var d1 = 'centralmtb', d2 = 'com';
  document.querySelectorAll('a[data-mail]').forEach(function(a){
    a.setAttribute('href', 'mailto:' + a.getAttribute('data-mail') + '@' + d1 + '.' + d2);
  });
})();
