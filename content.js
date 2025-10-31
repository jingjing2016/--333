
(async () => {
    await import("https://code.chatgptjs.org/chatgpt-latest.min.js");

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('LLM response copied to clipboard.');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }

    chatgpt.on('response', (response) => {
        copyToClipboard(response);
    });
})();
