module.exports = {
    data: [
        {
            title: 'Dette er en ny verden!',
            content: 'Forskere har funnet ny funn!',
            image: '1537344203174HomeTown.png',
            category: 'sport',
            importance: 1,
        },
        {
            title: 'Er Kotlin bedre enn Java?',
            content: 'Flere utviklere begynner å bruke Kotlin enn Java!',
            image: '1537344203174HomeTown.png',
            category: 'culture',
            importance: 1,
            created_at: Date.parse('2012-12-12T10:00:00'),
        }
    ],
    user: {
        email: 'test.testensen@test.com',
        password: '1234abcd',
        nickname: 'testity',
    },
    extra: {
        title: 'Er C++ raskere enn C?',
        content: 'Forskere har funnet ny funn!',
        image: '1537344203174HomeTown.png',
        category: 'IT',
        importance: 2,
        author: {
            email: 'test.testensen@test.com',
            nickname: 'testity'
        }
    }
}