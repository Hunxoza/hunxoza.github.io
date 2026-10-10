/*
 * EN / TH language toggle.
 * English lives in the HTML; it is captured on load so only Thai is
 * kept here. Choice is remembered in localStorage, and ?lang=th|en
 * in the URL overrides it (handy for sharing a Thai link).
 */
(function () {
    "use strict";

    var TH = {
        "meta.title": "โรสลินต์ ขวัญเกตุ - นักพัฒนาซอฟต์แวร์",
        "meta.desc":
            "โรสลินต์ ขวัญเกตุ นักพัฒนาซอฟต์แวร์ด้าน Odoo ERP และ full-stack development ผู้ร่วมก่อตั้งสตาร์ทอัพที่กำลังสร้างโปรดักต์ใหม่",

        "name.full": "โรสลินต์ ขวัญเกตุ",
        "name.first": "โรสลินต์",
        "name.last": "<em>ขวัญเกตุ</em>",
        "name.home": "โรสลินต์ ขวัญเกตุ - หน้าแรก",

        skip: "ข้ามไปยังเนื้อหา",

        "nav.about": "เกี่ยวกับฉัน",
        "nav.experience": "ประสบการณ์",
        "nav.projects": "ผลงาน",
        "nav.skills": "ทักษะ",
        "nav.contact": "ติดต่อ",

        "hero.eyebrow": "นักพัฒนาซอฟต์แวร์ · Odoo ERP · Full-stack",
        "hero.lead":
            "พัฒนาและปรับแต่งระบบ Odoo ERP ให้ธุรกิจค้าปลีกและ F&amp;B<br />และสร้างโปรดักต์ใหม่ในฐานะ co-founder ของสตาร์ทอัพ",
        "hero.cv": "ดาวน์โหลด CV",
        "hero.contact": "ติดต่อพูดคุย",

        "about.alt": "โรสลินต์ ขวัญเกตุ นั่งทำงานกับแล็ปท็อปข้างหน้าต่าง",
        "about.title": "ซอฟต์แวร์ที่เข้ากับ<span class=\"nw\">การทำงาน<em>จริง</em></span>",
        "about.p1":
            "นักพัฒนาซอฟต์แวร์ที่เชี่ยวชาญด้าน Odoo ERP และ full-stack development พัฒนาและปรับแต่งโมดูล Odoo ให้ลูกค้าในหลายอุตสาหกรรม <span class=\"nw\">โดยเฉพาะ</span>ค้าปลีกและ F&amp;B และสร้างโปรดักต์ใหม่ในฐานะ co-founder ของสตาร์ทอัพ",
        "about.p2":
            "สามารถนำเสนอสดต่อหน้าผู้ฟังบนเวทีได้ และอธิบายโซลูชันทางเทคนิคให้ลูกค้า<span class=\"nw\">ที่ไม่ได้อยู่</span>สายเทคนิคเข้าใจได้ง่าย มีพื้นฐานด้านการวิเคราะห์ข้อมูล และมีงานวิจัย<span class=\"nw\">ตีพิมพ์ใน IEEE</span>",
        "about.edu": "การศึกษา",
        "about.eduValue":
            "วท.บ. วิทยาการคอมพิวเตอร์<br />มหาวิทยาลัยกรุงเทพ (2021 - 2025)<br /><span class=\"nw\">เกรดเฉลี่ย 3.90</span>",
        "about.lang": "ภาษา",
        "about.langValue": "ไทย และอังกฤษ",
        "about.off": "นอกเวลางาน",
        "about.offValue": "อวกาศและดาราศาสตร์<br />การใช้ชีวิตอย่างยั่งยืน ทั้งต่อโลกและต่อตัวเอง",

        "str.design": "ออกแบบระบบ",
        "str.problem": "แก้ปัญหา",
        "str.product": "สร้างโปรดักต์ตั้งแต่เริ่มต้น",
        "str.collab": "ทำงานเป็นทีม",
        "str.learner": "เรียนรู้ไว",

        "exp.title": "งานที่ผ่านมา",
        "exp1.h": "Software Developer <span>· Newlogic</span>",
        "exp1.desc":
            "ออกแบบสถาปัตยกรรม API พัฒนาโมดูล Odoo ใหม่ และปรับแต่ง ต่อยอด หรืออัปเกรดโมดูลเดิมให้เข้ากับขั้นตอนการทำงานของลูกค้า วางระบบ ERP ให้ลูกค้าหลายกลุ่ม ทั้งเครือธุรกิจค้าปลีก<span class=\"nw\">หลายแบรนด์</span> ร้านอาหารและเครื่องดื่ม ธุรกิจสันทนาการ และบริการตรวจรับรองมาตรฐาน",
        "exp2.h": "Co-founder <span>· Stealth Startups</span>",
        "exp2.desc": "กำลังสร้างโปรดักต์ใหม่ 2 ตัวตั้งแต่ศูนย์ (mobile และ web)",
        "exp2.pet":
            "<strong>คอมมูนิตี้ pet-friendly:</strong> ตัดสินใจทิศทางและออกแบบโปรดักต์ โดยมี CTO ดูแลด้านสถาปัตยกรรมระบบ",
        "exp2.eco":
            "<strong>การใช้ชีวิตอย่างยั่งยืน:</strong> ทำเองทุกส่วน ตั้งแต่ออกแบบโปรดักต์ วางสถาปัตยกรรมระบบ พัฒนา backend ไปจนถึง deploy",
        "exp3.h": "Web Developer <span>· LearnCloud และ Novituz</span>",
        "exp3.desc":
            "พัฒนาหน้าเว็บแบบ responsive และฟีเจอร์ interactive ให้แพลตฟอร์ม e-learning รวมถึง<span class=\"nw\">เชื่อมต่อ</span> API สำหรับระบบจัดการคอร์สและผู้เรียน",
        "exp4.h": "นักศึกษาฝึกงาน Data Management <span>· ธนชาตประกันภัย</span>",
        "exp4.desc":
            "ฝึกงาน 3 เดือนในตำแหน่ง data analyst ทำ data cleansing และวิเคราะห์ข้อมูลประกันภัย รวมถึงช่วยพัฒนาระบบแบบ full-stack",

        "proj.eyebrow": "งานวิจัยและผลงาน",
        "proj.title": "ผลงานที่ภูมิใจ",
        "res.kicker": "งานวิจัย · IEEE Xplore",
        "res.desc":
            "งานวิจัยนี้ศึกษาพฤติกรรมการเรียนรู้ด้วยตนเองบนแพลตฟอร์ม FutureSkill โดยใช้ Python และ MySQL ในการเตรียมข้อมูล และใช้วิธีทางสถิติในการวิเคราะห์",
        "res.role": "Data engineer และ data analyst",
        "res.link": "อ่านงานวิจัย",
        "proj.earlier": "ผลงานสมัยเรียน (มหาวิทยาลัยและมัธยมปลาย)",
        "p1.desc":
            "ร่วมพัฒนาโปรแกรมให้ศูนย์ปฏิบัติการป้องกันภัยทางอากาศ กองทัพบก สำหรับติดตามอากาศยานจากเรดาร์เฝ้าระวังทั่วประเทศ",
        "p2.desc":
            "เกมออนไลน์ (MMO) สำหรับฝึกคำศัพท์<span class=\"nw\">ภาษาอังกฤษ</span> <span class=\"nw\">ได้รับทุน</span>โครงการต่อกล้า รุ่นที่ 7 จาก NECTEC และมูลนิธิเอสซีบี",
        "p3.desc":
            "เกมวางแผนบริหารทรัพยากรเพื่อสร้างหอคอย<span class=\"nw\">ให้สูงที่สุด</span> <span class=\"nw\">ได้รับรางวัล</span>ชมเชย NSC 2021 ประเภทโปรแกรมเพื่อความบันเทิง",
        "link.more": "ดูเพิ่มเติม",
        "link.video": "ดูวิดีโอ",

        "skills.title": "เครื่องมือที่ใช้เป็นประจำ",
        "skills.col1": "ทักษะ",
        "skills.col2": "Tech stack",

        "press.eyebrow": "สื่อ",
        "press.title": "บทความและเกียรติประวัติ",
        "press.school": "โรงเรียนสตรีอ่างทอง",
        "press.hof": "ทำเนียบเกียรติยศ (มัธยมปลาย)",

        "contact.title": "มาร่วมสร้างอะไรดี ๆ<br /><em>ไปด้วยกัน</em>",
        "contact.email": "อีเมล",
    };

    var root = document.documentElement;
    var metaDesc = document.querySelector('meta[name="description"]');
    var textEls = document.querySelectorAll("[data-i18n]");
    var attrEls = document.querySelectorAll("[data-i18n-attr]");
    var EN = { "meta.title": document.title, "meta.desc": metaDesc ? metaDesc.content : "" };

    textEls.forEach(function (el) {
        EN[el.getAttribute("data-i18n")] = el.innerHTML;
    });

    function attrPairs(el) {
        return el
            .getAttribute("data-i18n-attr")
            .split(";")
            .map(function (pair) {
                return pair.split(":");
            });
    }

    attrEls.forEach(function (el) {
        attrPairs(el).forEach(function (p) {
            EN[p[1]] = el.getAttribute(p[0]);
        });
    });

    function apply(lang) {
        var dict = lang === "th" ? TH : EN;
        function t(key) {
            return dict[key] != null ? dict[key] : EN[key];
        }

        textEls.forEach(function (el) {
            el.innerHTML = t(el.getAttribute("data-i18n"));
        });
        attrEls.forEach(function (el) {
            attrPairs(el).forEach(function (p) {
                el.setAttribute(p[0], t(p[1]));
            });
        });

        document.title = t("meta.title");
        if (metaDesc) metaDesc.content = t("meta.desc");
        root.lang = lang;

        document.querySelectorAll(".lang-toggle [data-lang]").forEach(function (s) {
            s.classList.toggle("is-active", s.getAttribute("data-lang") === lang);
        });

        try {
            localStorage.setItem("lang", lang);
        } catch (e) {}
    }

    function initialLang() {
        var param = new URLSearchParams(location.search).get("lang");
        if (param === "th" || param === "en") return param;
        try {
            var saved = localStorage.getItem("lang");
            if (saved === "th" || saved === "en") return saved;
        } catch (e) {}
        return (navigator.language || "").toLowerCase().indexOf("th") === 0 ? "th" : "en";
    }

    apply(initialLang());

    var toggle = document.querySelector(".lang-toggle");
    if (toggle) {
        toggle.addEventListener("click", function () {
            apply(root.lang === "th" ? "en" : "th");
        });
    }
})();
