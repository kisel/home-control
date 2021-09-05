
fetch("/api/actions")
    .then(data => data.json())
    .then(data => {
        let actions = document.getElementById("actions")
        for (let aDef of data.actions) {
            let btn = document.createElement("a");
            btn.classList.add("btn");
            btn.classList.add("btn-success");
            btn.onclick = () => {
                btn.classList.add("disabled");
                fetch("/api/actions/" + aDef.id, {method: 'POST'})
                    .catch(() => {alert("Request failed!")})
                    .then(() => {
                        setTimeout(() => {
                            btn.classList.remove("disabled")
                        }, 1000);
                    })
            }
            btn.text = aDef.label;
            actions.appendChild(btn)
        }
    })

