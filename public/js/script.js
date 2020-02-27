Vue.component('modal', {
    template: '#first-modal',
    props: ['id', 'offsetleft', 'offsettop'],
    data: function() {
        return {
            imagedata: {
                url: '',
                username: '',
                title: '',
                description: '',
                created_at: ''
            },
            usernameFromComment: '',
            comment: '',
            comments: []
        };
    },
    mounted: function() {
        //we can do axios request
        var me = this;

        const id = {
            id: me.id
        };

        //CSS for the modal

        const { modal } = this.$refs;
        console.log('ref from modal', this.$refs);
        // // gsap.from('#modalShow', 2 ,{scale:0.3,y: -1000});
        console.log(this.offsetleft, this.offsettop);
        console.log('mounted');
        gsap.from('#modalShow', 2, {
            scale: 0,
            x: this.offsetleft - 640,
            y: this.offsettop - 352
        });

        // console.log('mounted ready')
        // timeline.to('#modal-mask', 4, { y: 'random(500)'});

        //////

        //Send a request to axios to get the info about the image
        function changeid() {
            axios
                .post('/singleImage', id)
                .then(response => {
                    console.log('SingleImage', response);
                    let obj = response.data.response.rows[0];
                    let convertedDate = new Date(obj.created_at);

                    me.imagedata.url = obj.url;
                    me.imagedata.username = obj.username;
                    me.imagedata.title = obj.title;
                    me.imagedata.description = obj.description;
                    me.imagedata.created_at = convertedDate.toUTCString();
                })
                .catch(err => console.log(err));

            axios
                .post('/comments', id)
                .then(function(resp) {
                    console.log('resp from POST /comments', resp);
                    if (resp.data.response.rows.length != 0) {
                        me.comments = resp.data.response.rows;
                    }
                })
                .catch(err => console.log(err));
        }
        changeid();
    },
    watch: {
        id: function() {
            changeid();
        }
    },
    methods: {
        saveComment: function() {
            var me = this;
            const info = {
                id: this.id,
                usernameFromComment: this.usernameFromComment,
                comment: this.comment
            };
            axios
                .post('/saveComment', info)
                .then(function(resp) {
                    console.log('resp from POST /saveComment', resp);

                    me.comments = resp.data.response.rows;
                })
                .catch(err => console.log(err));
        },
        closeModal: function() {
            this.$emit('close');
        }
    }
});

new Vue({
    el: '#main',
    data: {
        images: [],
        title: '',
        description: '',
        username: '',
        file: null,
        id: location.hash.slice(1),
        addButton: null,
        offsetleft: null,
        offsettop: null,
        comments: []
    }, //data ends
    mounted: function() {
        console.log('the Vue component has mounted!');

        //We use me = this because in axios we dont use arrow function, so we have to bind this into it.
        var me = this;

        axios
            .get('/images')
            .then(function(response) {
                console.log(response.data.rows);
                if (response.data.rows) {
                    me.images = response.data.rows;
                    me.addButton = true;
                }
            })
            .catch(err => console.log(err))
            .then(() => {
                //Creating some CSS to the boxes when they start

                const { box } = me.$refs;
                const timeline = new TimelineLite();
                console.log(me.$refs, 'timeline', timeline);

                gsap.from('.form', 1, { y: 'random(40,60)', stagger: 0.25 });

                // timeline.from(box, 3, {
                //     x: 'random(-150,-100)',
                //     scale: 0.3,
                //     stagger: 0.25,
                //     ease: 'bounce.out'
                // });
                timeline.from(box, 3, {
                    x: 'random(1500,1000)',
                    scale: 0.3,
                    stagger: 0.25
                    // ease: 'bounce.out'
                });
                // timeline.to(box, 5, { x: 0, scale: 1 })
            });

        addEventListener('hashchange', function() {
            me.id=location.hash.slice(1)
        });
    },
    methods: {
        handleClick: function(e) {
            e.preventDefault();

            var me = this;

            console.log('clicked', this);

            var formData = new FormData();

            formData.append('title', this.title);
            formData.append('description', this.description);
            formData.append('username', this.username);
            formData.append('file', this.file);

            axios
                .post('/upload', formData)
                .then(function(resp) {
                    console.log('resp from POST /upload', resp);
                    //send image to the array
                    me.images.unshift(resp.data.newImage);
                })
                .catch(err => console.log(err));
        },
        handleChange: function(e) {
            console.log('HandleChange is running');
            console.log(e.target.files[0]);
            this.file = e.target.files[0];
        },
        handleMessage: function(message) {
            console.log('message received', message);
        },
        imageClicked: function(id) {
            console.log('clicked ImageClicked');
            if (!this.id) {
                this.id = id;
                console.log('imagedclicked', this);
            }
        },
        closeModal: function() {
            console.log('clicked CloseModal');
            gsap.to('#modalShow', 1, {
                scale: 0
            });
            // this.id = null;
            var me = this
            setTimeout(function(){
                me.id=  history.replaceState(null, null, ' ');
            },1000)
           
        },
        elementInfo: function(e) {
            this.offsetleft = e.target.offsetLeft;
            this.offsettop = e.target.offsetHeight;

            console.log(e.offsetLeft, 'test', e);
        },
        addMoreImages: function() {
            let lastImgId = '';
            this.images.forEach(element => {
                if (lastImgId.length == 0) {
                    lastImgId = element.id;
                } else if (element.id < lastImgId) {
                    lastImgId = element.id;
                }
            });
            var me = this;
            axios
                .get(`/getMoreImages/${lastImgId}`)
                .then(resp => {
                    // console.log('resp form addMoreImages', resp);
                    //data from addMoreImages is resp.data.response
                    //data from finished (to check the last one) is resp.data.resp

                    //push the new images to the images array
                    resp.data.response.forEach(newImg => {
                        me.images.push(newImg);
                        // gsap.from(newImg, 3, {
                        //     x: 'random(1500,1000)',
                        //     scale: 0.3,
                        //     stagger: 0.25
                        //     // ease: 'bounce.out'
                        // });
                        resp.data.resp1.forEach(checkId => {
                            // console.group(el)
                            if (checkId.lowestId == newImg.id) {
                                me.addButton = null;
                            }
                        });
                    });
                   
                })
                .catch(err => console.log(err));
        }
    }
});
