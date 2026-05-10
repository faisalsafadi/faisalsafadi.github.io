/**
 * data-loader.js v5
 * Lit <script id="fiche-data" type="application/json">
 * Zéro fetch — compatible file:// http:// https://
 */
(function () {
  'use strict';

  function init() {
    var el = document.getElementById('fiche-data');
    if (!el) { console.warn('[DL] #fiche-data introuvable'); return; }
    var d;
    try { d = JSON.parse(el.textContent || el.innerHTML); }
    catch (e) { console.warn('[DL] JSON invalide :', e.message); return; }

    injectDyn(d);
    injectCouleur(d.couleur_principale || '#ffa800');
    buildSousMenuServices(d.metier_services || []);
    updateFooterServices(d.metier_services || []);
    updateSelectServices(d.metier_services || []);
    buildServiceCards(d.services_detail || []);
    buildTemoignages(d.avis || []);
    buildFaq(d.faq || []);
    buildPortfolio(d.portfolio || []);
    updateLinks(d);
    updateMeta(d);
    updateHeroSlides(d);
    updateProgressBars(d);

    document.dispatchEvent(new CustomEvent('ficheLoaded', { detail: d }));
  }

  /* ── Injection data-dyn ─────────────────────────────── */
  function injectDyn(d) {
    document.querySelectorAll('[data-dyn]').forEach(function (el) {
      var v = d[el.getAttribute('data-dyn')];
      if (v === undefined || v === null) return;
      if (el.tagName === 'IMG') el.src = v;
      else el.textContent = v;
    });
  }

  /* ── Couleur principale ─────────────────────────────── */
  function injectCouleur(c) {
    var s = document.createElement('style');
    s.id = 'bt-couleur';
    s.textContent =
      ':root{--primary-color:' + c + '}' +
      '.bt_bb_headline_superheadline{color:' + c + '}' +
      '.bt_bb_button.bt_bb_color_scheme_5.bt_bb_style_filled a,' +
      '.bt_bb_button.bt_bb_style_filled a{background-color:' + c + '!important}' +
      '.bt_bb_accordion_item_number{background:' + c + '}' +
      '.pbar-fill{stroke:' + c + '}' +
      '.urgency-tel{color:' + c + '!important}' +
      '.btButtonWidgetLink{background:' + c + '!important;color:#252525!important}' +
      '.bt_bb_rating_icon i{color:' + c + '}';
    var old = document.getElementById('bt-couleur');
    if (old) old.remove();
    document.head.appendChild(s);
  }

  /* ── Sous-menu Services dynamique ───────────────────── */
  function buildSousMenuServices(services) {
    // Trouver le <li> "Services" dans le menu
    var servicesLi = null;
    document.querySelectorAll('#menu-primary-menu > li, #menu-primary-menu .menu-item').forEach(function (li) {
      var a = li.querySelector(':scope > a');
      if (a && /service/i.test(a.textContent)) servicesLi = li;
    });
    if (!servicesLi || !services.length) return;

    // Ajouter ou remplacer le sous-menu
    var sub = servicesLi.querySelector('.sub-menu');
    if (!sub) {
      sub = document.createElement('ul');
      sub.className = 'sub-menu';
      servicesLi.appendChild(sub);
    }
    sub.innerHTML = services.map(function (s) {
      return '<li><a href="#service-cards-grid">' + esc(s) + '</a></li>';
    }).join('');
    servicesLi.classList.add('menu-item-has-children');
  }
  function updateFooterServices(services) {
    var footerList = document.getElementById('footer-services-list');
    if (!footerList || !services.length) return;
    footerList.innerHTML = services.slice(0, 4).map(function (s) {
      return '<li><a href="#service-cards-grid">' + esc(s) + '</a></li>';
    }).join('');
  }
  function updateSelectServices(services) {
    var $sel = document.getElementById('select-service');
    if (!$sel || !services.length) return;
    $sel.innerHTML = '<option value="">Sélectionnez un service</option>';
    services.forEach(function (s) { $sel.appendChild(new Option(s, s)); });
    $sel.selectedIndex = 0;
  }


  /* ── Service Cards ──────────────────────────────────── */
  function buildServiceCards(services) {
    var grid = document.getElementById('service-cards-grid');
    if (!grid || !services.length) return;

    var cols = services.map(function (s) {
      var img = s.image || 'images/default/service_default.jpg';
      return '<div class="bt_bb_column col-xxl-3 col-xl-3 col-lg-3 col-md-6 col-sm-6 bt_bb_vertical_align_top bt_bb_align_left bt_bb_padding_text_indent bt_bb_animation_fade_in animate bt_bb_style_hover_shadow">' +
        '<div class="bt_bb_column_content" style="background-color:rgba(255,255,255,1);margin: 10px;">' +
        '<div class="bt_bb_column_content_inner">' +
        '<div class="bt_bb_image bt_bb_shape_square" style="height:256px;overflow:hidden;">' +
        '<span><img src="' + esc(img) + '" alt="' + esc(s.titre) + '" style="width:100%;height:256px;object-fit:cover;" onerror="this.src=\'images/default/service_default.jpg\'"></span>' +
        '</div>' +
        '<div class="bt_bb_separator bt_bb_border_style_none bt_bb_bottom_spacing_small"></div>' +
        '<header class="bt_bb_headline bt_bb_font_weight_medium bt_bb_dash_none bt_bb_superheadline bt_bb_size_medium bt_bb_align_inherit" style="padding:0 20px;">' +
        '<h4 style="color:#181818;">' +
        '<span>' + esc(s.titre) + '</span>' +
        '</h4>' +
        '</header>' +
        '<div class="bt_bb_separator bt_bb_border_style_none bt_bb_bottom_spacing_normal"></div>' +
        '</div>' +
        '</div>' +
        '</div>';
    }).join('');

    // === CONSERVER LE .bt_bb_row_holder ===
    let holder = grid.querySelector('.bt_bb_row_holder');
    if (!holder) {
      holder = document.createElement('div');
      holder.className = 'bt_bb_row_holder';
      grid.appendChild(holder);
    }
    holder.innerHTML = cols;
  }

  /* ── Témoignages dynamiques ─────────────────────────── */
  function buildTemoignages(avis) {
    var slider = document.getElementById('temoignages-slider');
    if (!slider || !avis.length) return;

    slider.innerHTML = avis.map(function (a) {
      var init = (a.auteur || '?').charAt(0).toUpperCase();
      return '<div class="bt_bb_content_slider_item">' +
        '<div class="bt_bb_content_slider_item_content content" style="text-align:center;">' +
        '<div class="bt_bb_text">' +
        '<blockquote><p>' + esc(a.texte) + '</p></blockquote>' +
        '</div>' +
        // Avatar initiale (pas d'image → initiale colorée)
        '<div style="width:80px;height:80px;border-radius:50%;background:var(--primary-color,#ffa800);color:#fff;font-size:28px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;margin:12px auto;">' +
        init +
        '</div>' +
        '<div class="bt_bb_separator bt_bb_border_style_none bt_bb_bottom_spacing_extra_small"></div>' +
        '<header class="bt_bb_headline bt_bb_subheadline_font_weight_normal bt_bb_dash_none bt_bb_subheadline bt_bb_size_small bt_bb_align_inherit">' +
        '<h5><span class="bt_bb_headline_content"><span>' + esc(a.auteur) + '</span></span></h5>' +
        '<div class="bt_bb_headline_subheadline" style="color:#808080;">' + esc(a.ville || '') + '</div>' +
        '</header>' +
        '<div class="bt_bb_separator bt_bb_border_style_none bt_bb_bottom_spacing_medium"></div>' +
        '</div>' +
        '</div>';
    }).join('');
  }

  /* ── FAQ dynamique ──────────────────────────────────── */
  function buildFaq(faq) {
    var acc = document.getElementById('faq-accordion');
    if (!acc || !faq.length) return;

    acc.innerHTML = faq.map(function (item, i) {
      return '<div class="bt_bb_accordion_item">' +
        '<div class="bt_bb_accordion_item_number">' + (i + 1) + '</div>' +
        '<div class="bt_bb_accordion_item_title">' + esc(item.question) + '</div>' +
        '<div class="bt_bb_accordion_item_content">' +
        '<div class="bt_bb_text"><p>' + esc(item.reponse) + '</p></div>' +
        '</div>' +
        '</div>';
    }).join('');
  }

  function buildPortfolio(portfolio) {
    var container = document.getElementById('portfolio-container');
    if (!container || !portfolio.length) return;

    container.innerHTML = portfolio.map(function (item) {
      return '<div class="portfolio-item"><img src="' + esc(item.image) + '" alt="' + esc(item.titre) + '" onerror="this.src=\'images/default/inner_07-640x900.jpg\'"></div>';
    }).join('');
  }

  /* ── Liens tel / mail ───────────────────────────────── */
  function updateLinks(d) {
    var tel = (d.telephone || '').replace(/\s/g, '');
    var mail = d.email || '';
    document.querySelectorAll('[data-tel]').forEach(function (el) {
      if (tel) el.href = 'tel:' + tel;
    });
    document.querySelectorAll('[data-mail]').forEach(function (el) {
      if (mail) el.href = 'mailto:' + mail;
    });
    // Mettre à jour les textes téléphone partout
    document.querySelectorAll('.tel-txt').forEach(function (el) {
      if (d.telephone) el.textContent = d.telephone;
    });
  }

  /* ── Meta title/description ─────────────────────────── */
  function updateMeta(d) {
    var t = (d.nom_entreprise || 'Artisan') + ' — ' + (d.metier || '') + ' à ' + (d.ville || '');
    document.title = t;
    var m = document.querySelector('meta[name="description"]');
    if (m) m.content = d.description_courte || t;
  }

  /* ── Hero slides : superheadline + title ────────────── */
  function updateHeroSlides(d) {
    // Slide 1
    var sh1 = document.getElementById('hero-sh-1');
    var ht1 = document.getElementById('hero-title-1');
    if (sh1) sh1.textContent = (d.metier || 'Artisan').toUpperCase();
    if (ht1 && d.nom_entreprise) {
      ht1.innerHTML = '<b>' + esc(d.nom_entreprise) + '</b><br>à ' + esc(d.ville || '');
    }
    // Slide 2
    var ht2 = document.getElementById('hero-title-2');
    if (ht2 && d.annees_experience) {
      ht2.innerHTML = 'Plus de <b>' + esc(String(d.annees_experience)) + ' ans</b><br>d\'expérience';
    }
    // Slide 3 — slogan
    var sl3 = document.getElementById('hero-slogan-3');
    if (sl3 && d.slogan) sl3.textContent = d.slogan;
  }

  /* ── Progress bars : 4e cercle = années d'expérience ── */
  function updateProgressBars(d) {
    var exp = parseInt(d.annees_experience) || 10;
    var pct = Math.min(exp * 3, 95); // ex: 12 ans → 36%
    var pbar4 = document.getElementById('pbar-experience');
    if (!pbar4) return;
    pbar4.setAttribute('data-container-percentage', pct / 100);
    var txt = pbar4.querySelector('.progressbar-text');
    if (txt) txt.textContent = exp + '+';
    // Mettre à jour le SVG path
    var path = pbar4.querySelector('path:last-child');
    if (path) {
      var circum = 301.635;
      var offset = circum * (1 - pct / 100);
      path.style.strokeDashoffset = offset;
    }
    var p = pbar4.querySelector('p');
    if (p) p.textContent = 'Années d\'expérience dans le métier';
  }

  /* ── Escape HTML ─────────────────────────────────────── */
  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ── Boot ───────────────────────────────────────────── */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
