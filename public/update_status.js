
setInterval(function() {
    fetch("/api/status")
        .then(data => data.json())
        .then(data => {
            let status = document.getElementById("status")
            if (status) {
                status.textContent = JSON.stringify(data, undefined, 2);
            }
        })
}, 1000)
