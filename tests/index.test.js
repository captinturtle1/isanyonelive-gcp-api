const channels = ["lofigirl", "ludwig", "destiny"];

test('tests local api', () => {
    fetch('http://localhost:8080', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(channels)
    })
    .then(response => response.json())
    .then(data => {
        expect(data.body.length).toBe(channels.length);
    })
    .catch(console.log); 
});