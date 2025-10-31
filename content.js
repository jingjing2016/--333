
(async () => {
    try {
        await import(chrome.runtime.getURL('chatgpt.js'));
    } catch (err) {
        console.error('Failed to import chatgpt.js:', err);
        return;
    }

    let settings = {
        polling_interval: 1000,
        play_sound: true
    };

    let pollingIntervalId;
    let lastResponse = '';

    function playBeep() {
        if (!settings.play_sound) {
            return;
        }
        const context = new AudioContext();
        const oscillator = context.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, context.currentTime);
        oscillator.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.1);
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('LLM response copied to clipboard.');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }

    function startPolling() {
        pollingIntervalId = setInterval(async () => {
            const response = await chatgpt.getLastResponse();
            if (response && response !== lastResponse) {
                lastResponse = response;
                playBeep();
                copyToClipboard(response);
            }
        }, settings.polling_interval);
    }

    function stopPolling() {
        clearInterval(pollingIntervalId);
    }

    // Load settings and start polling
    chrome.storage.sync.get(['polling_interval', 'play_sound'], (data) => {
        if (data.polling_interval) {
            settings.polling_interval = data.polling_interval;
        }
        if (data.play_sound !== undefined) {
            settings.play_sound = data.play_sound;
        }
        startPolling();
    });

    // Listen for settings changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (changes.polling_interval) {
            settings.polling_interval = changes.polling_interval.newValue;
            stopPolling();
            startPolling();
        }
        if (changes.play_sound) {
            settings.play_sound = changes.play_sound.newValue;
        }
    });
})();
