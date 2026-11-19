async function throwIfFailed(response) {
    if (response.ok) return response
    throw new Error(await response.text())
}

export const api = (url, options) => fetch(url, options).then(throwIfFailed)

export const getJson = async url => (await api(url)).json()

export const json = (method, body) => ({
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
})

export const alertError = error => alert(error.message)
