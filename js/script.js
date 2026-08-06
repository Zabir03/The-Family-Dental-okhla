(function(){
  "use strict";

  /* ---------- CONFIG ----------------------------------------------------
     FORM_ENDPOINT: paste your form service URL here (Formspree, Web3Forms,
     Google Apps Script, or your own PHP/Node handler).
     While it is empty the form runs in DEMO mode: nothing is sent anywhere.

     WHATSAPP_NUMBER: clinic's WhatsApp number in international format,
     digits only (no +, spaces or dashes). Every appointment request is
     sent here as a formatted WhatsApp message, regardless of FORM_ENDPOINT.
  ---------------------------------------------------------------------- */
  var FORM_ENDPOINT = "";
  var WHATSAPP_NUMBER = "917982697125";

  var TZ = "Asia/Kolkata";
  /* 0 = Sunday. Times in minutes from midnight. */
  var HOURS = {
    0:[660,900], 1:[630,1320], 2:[630,1320], 3:[630,1320],
    4:[630,1320], 5:[660,1320], 6:[660,1320]
  };
  var DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var $  = function(s,c){return (c||document).querySelector(s)};
  var $$ = function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

  /* ---------- CLINIC TIME (Asia/Kolkata, wherever the visitor is) ------- */
  function clinicNow(){
    var p = new Intl.DateTimeFormat("en-GB",{timeZone:TZ,weekday:"short",hour:"2-digit",minute:"2-digit",hour12:false,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
    var o = {}; p.forEach(function(x){o[x.type]=x.value});
    var idx = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(o.weekday);
    var h = parseInt(o.hour,10) % 24;
    return {day:idx, mins:h*60+parseInt(o.minute,10), date:o.year+"-"+o.month+"-"+o.day};
  }
  function fmt(m){
    var h = Math.floor(m/60), mm = m%60, ap = h>=12?"PM":"AM", hh = h%12||12;
    return hh+(mm?":"+String(mm).padStart(2,"0"):"")+" "+ap;
  }
  function status(){
    var n = clinicNow(), t = HOURS[n.day], open = t && n.mins>=t[0] && n.mins<t[1];
    var msg;
    if(open){
      msg = "Closes at "+fmt(t[1]);
    } else if(t && n.mins<t[0]){
      msg = "Opens at "+fmt(t[0])+" today";
    } else {
      var d = (n.day+1)%7;
      msg = "Opens "+DAY_NAMES[d].slice(0,3)+" at "+fmt(HOURS[d][0]);
    }
    return {open:open, msg:msg, day:n.day};
  }
  function paintStatus(){
    var s = status();
    var label = s.open ? "Open now" : "Closed now";
    var hero = $("#statusHero"), heroMeta = $("#statusHeroMeta"), hours = $("#statusHours");
    if(hero){hero.textContent = label; heroMeta.textContent = s.msg}
    if(hours){hours.textContent = label+" · "+s.msg}
    $$(".dot").forEach(function(d){d.classList.toggle("is-open", s.open)});
    $$(".rail__row").forEach(function(r){
      r.classList.toggle("is-today", Number(r.getAttribute("data-day")) === s.day);
    });
  }

  /* ---------- HOURS RAIL: draw a bar per day (10 AM – 10 PM scale) ------ */
  function drawRail(){
    var START = 600, END = 1320, SPAN = END-START;
    $$(".rail__row").forEach(function(row){
      var t = HOURS[Number(row.getAttribute("data-day"))];
      var bar = $(".rail__bar", row);
      if(!t || !bar) return;
      bar.style.left  = ((t[0]-START)/SPAN*100).toFixed(2)+"%";
      bar.style.width = ((t[1]-t[0])/SPAN*100).toFixed(2)+"%";
    });
  }

  /* ---------- HEADER: shadow, mobile menu, active link ------------------ */
  var header = $("#header"), burger = $("#burger"), nav = $("#nav");
  function onScroll(){ header.classList.toggle("is-stuck", window.scrollY > 8) }
  window.addEventListener("scroll", onScroll, {passive:true}); onScroll();

  function closeMenu(){ nav.classList.remove("is-open"); burger.setAttribute("aria-expanded","false"); burger.setAttribute("aria-label","Open menu") }
  burger.addEventListener("click", function(){
    var open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  nav.addEventListener("click", function(e){ if(e.target.closest("a")) closeMenu() });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape") closeMenu() });
  window.addEventListener("resize", function(){ if(window.innerWidth >= 1180) closeMenu() });

  var links = $$(".nav__link");
  if("IntersectionObserver" in window){
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(!en.isIntersecting) return;
        links.forEach(function(a){
          a.setAttribute("aria-current", String(a.getAttribute("href") === "#"+en.target.id));
        });
      });
    },{rootMargin:"-45% 0px -50% 0px"});
    $$("section[id]").forEach(function(s){spy.observe(s)});

    /* ---------- Scroll reveal ---------- */
    var reveal = new IntersectionObserver(function(entries,obs){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add("is-in"); obs.unobserve(en.target) }
      });
    },{rootMargin:"0px 0px -8% 0px", threshold:.08});
    $$(".section .head, .card, .form, .aside-card, .hours, .score, .qa, .split__media, .info, .map").forEach(function(el,i){
      el.classList.add("reveal");
      el.style.transitionDelay = (i%4)*60+"ms";
      reveal.observe(el);
    });
  }

  /* ---------- FAQ accordion ---------- */
  $$(".qa__btn").forEach(function(btn){
    btn.addEventListener("click", function(){
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      var open  = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      panel.classList.toggle("is-open", !open);
    });
  });

  /* ---------- Service card → prefill the form ---------- */
  $$(".service__link").forEach(function(b){
    b.addEventListener("click", function(){
      var sel = $("#f-treatment");
      sel.value = b.getAttribute("data-service") || "";
      document.getElementById("book").scrollIntoView({behavior:"smooth", block:"start"});
      setTimeout(function(){ $("#f-name").focus({preventScroll:true}) }, 500);
    });
  });

  /* ---------- Map: load the iframe only when asked (keeps LCP fast) ----- */
  var loadMap = $("#loadMap");
  if(loadMap){
    loadMap.addEventListener("click", function(){
      var f = document.createElement("iframe");
      /* Replace with the official embed URL from your Google Business Profile
         (Google Maps → Share → Embed a map) for an exact pin. */
      f.src = "https://www.google.com/maps?q=" + encodeURIComponent("The Family Dental, I-35/B Moti Apartment, Thokar No. 4, Abul Fazal Enclave Part 1, Jamia Nagar, Okhla, New Delhi 110025") + "&output=embed";
      f.title = "Map showing The Family Dental Okhla in Abul Fazal Enclave, Jamia Nagar";
      f.loading = "lazy";
      f.referrerPolicy = "no-referrer-when-downgrade";
      f.setAttribute("allowfullscreen","");
      $("#map").appendChild(f);
      $("#mapFacade").remove();
    });
  }

  /* ---------- Appointment form ---------- */
  var form = $("#apptForm"), okState = $("#okState"), badState = $("#badState"),
      btn = $("#submitBtn"), label = $("#submitLabel"), loadedAt = Date.now();

  var dateInput = $("#f-date");
  if(dateInput) dateInput.min = clinicNow().date;

  function setErr(id, msg){
    var input = $("#f-"+id), out = $("#e-"+id);
    if(out) out.textContent = msg || "";
    if(input) input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }
  function validate(){
    var ok = true, v = function(id){ return ($("#f-"+id).value || "").trim() };
    ok = setErr("name", v("name").length < 2 ? "Please enter your full name." : "") && ok;
    var digits = v("phone").replace(/\D/g,"");
    ok = setErr("phone", !/^(91)?[6-9]\d{9}$/.test(digits) ? "Enter a valid 10-digit mobile number." : "") && ok;
    var em = v("email");
    ok = setErr("email", em && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(em) ? "Enter a valid email address, or leave it blank." : "") && ok;
    ok = setErr("date", !v("date") ? "Choose a preferred date." : (v("date") < clinicNow().date ? "Please choose today or a later date." : "")) && ok;
    ok = setErr("time", !v("time") ? "Choose a preferred time." : "") && ok;
    ok = setErr("treatment", !v("treatment") ? "Tell us the reason for your visit." : "") && ok;
    return ok;
  }

  /* ---------- WhatsApp: format the request and open a prefilled chat ---- */
  function prettyDate(iso){
    if(!iso) return "";
    var d = new Date(iso+"T00:00:00");
    if(isNaN(d)) return iso;
    return d.toLocaleDateString("en-IN",{weekday:"short",day:"2-digit",month:"short",year:"numeric"});
  }
  function buildWhatsAppMessage(payload){
    var lines = [
      "*New Appointment Request*",
      "_The Family Dental, Okhla_",
      "",
      "*Name:* "+payload.name,
      "*Phone:* "+payload.phone
    ];
    if(payload.email) lines.push("*Email:* "+payload.email);
    lines.push("*Preferred Date:* "+prettyDate(payload.date));
    lines.push("*Preferred Time:* "+payload.time);
    lines.push("*Treatment / Reason:* "+payload.treatment);
    if(payload.message) lines.push("*Message:* "+payload.message);
    lines.push("");
    lines.push("Sent via the appointment form on the website.");
    return lines.join("\n");
  }
  function sendToWhatsApp(payload){
    var url = "https://wa.me/"+WHATSAPP_NUMBER+"?text="+encodeURIComponent(buildWhatsAppMessage(payload));
    window.open(url, "_blank", "noopener");
  }

  form.addEventListener("submit", function(e){
    e.preventDefault();
    badState.classList.remove("is-on");

    /* spam guards: honeypot + minimum time on page */
    if($("#f-company").value !== "" || Date.now() - loadedAt < 3000){
      okState.classList.add("is-on");
      form.style.display = "none";
      return;
    }
    if(!validate()){
      var bad = form.querySelector('[aria-invalid="true"]');
      if(bad){ bad.focus(); bad.scrollIntoView({behavior:"smooth", block:"center"}) }
      return;
    }

    var payload = Object.fromEntries(new FormData(form).entries());
    payload.submittedAt = new Date().toISOString();

    /* open WhatsApp synchronously, in the same click, so browsers don't block the popup */
    sendToWhatsApp(payload);

    btn.disabled = true;
    label.innerHTML = '<span class="spinner" aria-hidden="true"></span> Sending…';

    var request = FORM_ENDPOINT
      ? fetch(FORM_ENDPOINT, {method:"POST", headers:{"Content-Type":"application/json", "Accept":"application/json"}, body:JSON.stringify(payload)})
          .then(function(r){ if(!r.ok) throw new Error("Bad response"); })
      : (console.warn("[Appointment form] FORM_ENDPOINT is not set — request was sent to WhatsApp only, no copy was stored on a server."), new Promise(function(res){setTimeout(res,700)}));

    request.then(function(){
      form.style.display = "none";
      okState.classList.add("is-on");
      okState.focus();
    }).catch(function(){
      badState.classList.add("is-on");
    }).then(function(){
      btn.disabled = false;
      label.textContent = "Request appointment";
    });
  });

  /* ---------- Init ---------- */
  $("#year").textContent = new Date().getFullYear();
  drawRail();
  paintStatus();
  setInterval(paintStatus, 60000);
})();
