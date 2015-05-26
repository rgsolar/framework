BEST.module('arkady.pevzner:control-flow:static-repeat', 'HEAD', {
    behaviors: {
        '#repeat': {
            size: [100, 100],
            $repeat: [
                {position: [100, 100], content: 'Element 1'},
                {position: [210, 100], content: 'Element 2'},
                {position: [320, 100], content: 'Element 3'},
                {position: [430, 100], content: 'Element 4'},
                {position: [540, 100], content: 'Element 5'}
            ],
            style: {
                border: '1px solid black'
            }
        }
    },
    tree: 'static-repeat.html',
})
.config({
    imports: {
        'famous:core': ['ui-element', 'view', 'dom-element']
    }
});