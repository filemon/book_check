/**
 * This template is a production ready boilerplate for developing with `CheerioCrawler`.
 * Use this to bootstrap your projects using the most up-to-date code.
 * If you're looking for examples or want to learn more, see README.
 */

const Apify = require('apify');

const { utils: { log } } = Apify;

Apify.main(async () => {
    const { startUrls, book } = await Apify.getInput();

    const requestList = await Apify.openRequestList('start-urls', startUrls);
    const requestQueue = await Apify.openRequestQueue();
    const proxyConfiguration = await Apify.createProxyConfiguration();

    const crawler = new Apify.CheerioCrawler({
        requestList,
        requestQueue,
        proxyConfiguration,
        // Be nice to the websites.
        // Remove to unleash full power.
        maxConcurrency: 50,
        handlePageFunction: async (context) => {
            const {$} = context;
            const { url, userData: { label } } = context.request;
            log.info('Page opened.', { label, url });
            log.info('Searching for book ' + book);
            const exists = $('a.jmeno_produkt').filter(function() {
                return $(this).text().trim() === book;
            });

            if(exists.length > 0 ) {
                log.info('Sending email');
                await Apify.call('apify/send-mail', {
                    to: 'jiri.fabian@gmail.com',
                    subject: `${book} available!`,
                    text: `Buy now - ${url}`,
                });
            }
        },
    });

    log.info('Starting the crawl.');
    await crawler.run();
    log.info('Crawl finished.');
});
