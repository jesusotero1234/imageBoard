console.log('test');

new Vue({
    el: '#main',
    data: {
        images:[]

    },
    mounted: function() {


        console.log('the Vue component has mounted!');
        console.table('this.cities', this.cities);

        //We use me = this because in axios we dont use arrow function, so we have to bind this into it.
        var me = this

        axios.get('/images').then(function(response) {
            console.log(response.data.rows);
            me.images = response.data.rows
        });
    },
    methods: {
        muffin: function(citiName) {
            console.log('muffing is running', citiName);
        }
    }
});
