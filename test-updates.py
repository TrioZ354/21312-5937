import asyncio, json
from urllib.parse import unquote
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path('/home/user/pero-checks')
OUT.mkdir(exist_ok=True)

async def check_top(page):
    link = page.get_by_role('link', name='Вернуться наверх страницы', exact=True)
    assert await link.count() == 1
    assert await link.is_visible()
    assert await link.evaluate('(el) => el.parentElement === document.body')
    assert await link.evaluate('el => {const r=el.getBoundingClientRect(); return r.top>=0 && r.bottom<=innerHeight && r.left>=0 && r.right<=innerWidth && el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}')

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
        page = await browser.new_page(viewport={'width':1440,'height':1000}, reduced_motion='reduce')
        errors=[]
        page.on('pageerror', lambda e: errors.append(str(e)))
        await page.goto('http://localhost:4200',wait_until='networkidle')
        await check_top(page)
        await page.screenshot(path=str(OUT/'desktop-top.png'))
        assert await page.title() == 'Перо Измерений: Вельд’Эран | TrioZ Entertainment'
        for section in ['#world','#factions','#battle','#armies','#gods','#play','#rules','#order','#ecosystem','footer']:
            await page.locator(section).scroll_into_view_if_needed()
            await check_top(page)
        names=['Империя','Республика','Суббгары','Дворфы','Дэлионы','Авэйны','Союз Древних','Тролли','Тёмные','Серебряный мятеж']
        sources=[]
        for name in names:
            await page.get_by_role('tab',name=name,exact=True).click()
            img=page.locator('.faction-art')
            await img.evaluate('(el) => el.decode()')
            sources.append(await img.get_attribute('src'))
            assert await page.locator('#faction-panel h3').inner_text() == name
            assert name in await img.get_attribute('alt')
        assert len(set(sources))==10
        await page.get_by_role('tab',name='Дворфы',exact=True).click()
        await page.locator('#factions').screenshot(path=str(OUT/'desktop-factions.png'))
        await page.locator('.world-map').click()
        assert await page.locator('.image-dialog').is_visible()
        await page.keyboard.press('Escape')
        assert await page.locator('.image-dialog').count()==0
        card=page.get_by_role('button',name='Перевернуть боевую карту 3',exact=True)
        await card.click()
        assert await card.get_attribute('aria-pressed')=='true'
        await card.click()
        assert await card.get_attribute('aria-pressed')=='false'
        await page.locator('.rules-accordion > summary').click()
        await page.locator('.rules-scans button').first.click()
        assert await page.locator('.image-dialog').is_visible()
        await page.keyboard.press('Escape')
        await page.locator('#order').scroll_into_view_if_needed()
        await page.get_by_role('button',name='Подробнее',exact=True).click()
        assert await page.locator('.privacy-dialog').is_visible()
        await page.keyboard.press('Escape')
        select=page.locator('select[name=quantity]')
        assert await select.locator('option').evaluate_all('(els)=>els.map(e=>e.value)') == ['1','2','3','4','5','wholesale']
        for n in range(1,6):
            await select.select_option(str(n))
            assert await page.locator('.wholesale-hint').count()==0
        await select.select_option('wholesale')
        assert await page.locator('.wholesale-hint').is_visible()
        assert 'от 6' in await page.locator('textarea').get_attribute('placeholder')
        await page.locator('input[name=name]').fill('Тестовый посетитель')
        await page.locator('input[name=email]').fill('test@example.com')
        await page.locator('textarea[name=message]').fill('10 экземпляров, проверка без отправки письма')
        await page.locator('input[name=consent]').check()
        assert await page.get_by_role('button',name='Подготовить письмо',exact=True).is_visible()
        await page.get_by_role('button',name='Подготовить письмо',exact=True).click()
        await page.get_by_text('Письмо подготовлено, но ещё не отправлено',exact=True).wait_for()
        href=await page.get_by_role('link',name='Открыть письмо ещё раз').get_attribute('href')
        assert 'Оптом — 6 и более экземпляров' in unquote(href)
        await page.locator('#order').screenshot(path=str(OUT/'desktop-order.png'))
        api=await page.evaluate('''async () => {
          const {client}=await import('/src/web/lib/api.ts');
          const config=await client.orders.config();
          if(config.automaticEmail) throw Error('Refusing to send test emails');
          const input={name:'Тест',email:'test@example.com',message:'Проверка',consent:true,website:''};
          const accepted=[];
          for(const quantity of [1,2,3,4,5,'wholesale']) {
            const result=await client.orders.create({...input,quantity});
            if(result.sent || !result.mailto) throw Error('Invalid draft response');
            accepted.push(quantity);
          }
          let rejected=0;
          for(const quantity of [0,6,100,-1,1.5]) {
            try {await client.orders.create({...input,quantity})} catch {rejected++}
          }
          try {await client.orders.create({...input,quantity:1,consent:false})} catch {rejected++}
          return {accepted,rejected};
        }''')
        assert api['rejected']==6,api
        for section in ['#world','#factions','#battle','#armies','#gods','#play','#rules','#order','#ecosystem']:
            await page.locator(section).scroll_into_view_if_needed()
        broken=await page.evaluate('[...document.images].filter(x=>x.complete&&!x.naturalWidth).map(x=>x.src)')
        assert not broken,broken
        assert not errors,errors
        await page.get_by_role('link',name='Вернуться наверх страницы',exact=True).click()
        assert await page.evaluate('window.scrollY')==0
        assert await page.evaluate('document.activeElement.id')=='top'
        mobile=await browser.new_page(viewport={'width':390,'height':844},is_mobile=True,reduced_motion='reduce')
        await mobile.goto('http://localhost:4200',wait_until='networkidle')
        await check_top(mobile)
        await mobile.screenshot(path=str(OUT/'mobile-top.png'))
        await mobile.get_by_role('button',name='Открыть меню').click()
        await mobile.locator('.mobile-nav a[href="#factions"]').click()
        assert await mobile.locator('.mobile-nav').count()==0
        await mobile.get_by_role('tab',name='Дворфы',exact=True).click()
        await mobile.locator('#factions').screenshot(path=str(OUT/'mobile-factions.png'))
        for section in ['#world','#factions','#battle','#armies','#gods','#play','#rules','#order','#ecosystem','footer']:
            await mobile.locator(section).scroll_into_view_if_needed()
            await check_top(mobile)
        await mobile.get_by_role('link',name='Вернуться наверх страницы',exact=True).click()
        assert await mobile.evaluate('window.scrollY')==0
        for width in [320,390,768,1024,1440]:
            await mobile.set_viewport_size({'width':width,'height':900})
            assert await mobile.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
            await check_top(mobile)
        result={'desktop':'passed','mobile':'passed','factionImages':len(set(sources)),'topButton':'visible and clickable in every section','API':api,'consoleErrors':errors,'email':'drafts only; no email sent'}
        (OUT/'results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
        print(json.dumps(result,ensure_ascii=False))
        await browser.close()

asyncio.run(main())