// import { TimelineLite } from 'gsap'

new Vue({
    el: '#main',
    data: {
        images: [],
        title: '',
        description: '',
        username: '',
        file: null
    }, //data ends
    mounted: function() {
       
        console.log('the Vue component has mounted!');

        //We use me = this because in axios we dont use arrow function, so we have to bind this into it.
        var me = this;

        axios
            .get('/images')
            .then(function(response) {
                console.log(response.data.rows);
                me.images = response.data.rows;
                
               
                
               

            })
            .catch(err => console.log(err)).then(()=>{


                 //Creating some CSS to the boxes when they start

                const { box, logo, form } = me.$refs
                const timeline = new TimelineLite() 
                console.log(me.$refs, 'timeline',timeline) 
    
                gsap.from(".form", 1, { y: "random(40,60)", stagger:0.25})
               
                timeline.from(box, 3, { x: "random(-150,-100)",  scale: 0.3, stagger:0.25, ease: "bounce.out",}) 
                // timeline.to(box, 5, { x: 0, scale: 1 }) 
            });
    },
    methods: {
        handleClick: function(e) {
            e.preventDefault();

            var me = this;

            console.log('clicked', this);

            var formData = new FormData();

            formData.append('title', this.title)
            formData.append('description', this.description)
            formData.append('username', this.username)
            formData.append('file', this.file)
          
            axios.post('/upload',formData).then(function(resp){

                console.log('resp from POST /upload', resp)
                //send image to the array
                me.images.unshift(resp.data.newImage)


            }).catch(err=>console.log(err))


        },
        handleChange: function(e) {
            console.log('HandleChange is running');
            console.log(e.target.files[0])
            this.file= e.target.files[0]
        }
    }
});
