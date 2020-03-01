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
            error: '',
            like: 0,
            dislike: 0,
            comments: []
        };
    },
    mounted: function() {
        //we can do axios request

        //CSS for the moda

        console.log('ref from modal', this.$refs);
        // // gsap.from('#modalShow', 2 ,{scale:0.3,y: -1000});
        console.log(this.offsetleft, this.offsettop);
        console.log('mounted');
        gsap.from('#modalShow', 0.5, {
            scale: 0,
            x: this.offsetleft - 640,
            y: this.offsettop - 640,
            ease: 'elastic. out( 1, 0.3)'
        });

        // Arrows transition

        gsap.from('.arrow-left', 0.5, {
            x: -1000,
            ease: 'slow( 0.7, 0.7, false)'
        });

        gsap.from('.right', 0.5, {
            x: +1000,
            ease: 'slow( 0.7, 0.7, false)'
        });

        //////

        this.changeId();
        this.likeDataCheck();
    },
    watch: {
        id: function() {
            this.changeId();
            this.likeDataCheck();
        }
    },
    methods: {
        changeId: function() {
            var me = this;
            const id2 = {
                id: me.id
            };
            console.log('id2', id2);
            axios
                .post('/singleImage', id2)
                .then(response => {
                    console.log('SingleImage', response);
                    let obj = response.data.response.rows[0];
                    let convertedDate = moment(
                        obj.created_at,
                        'YYYYMMDD'
                    ).fromNow();

                    me.imagedata.url = obj.url;
                    me.imagedata.username = obj.username;
                    me.imagedata.title = obj.title;
                    me.imagedata.description = obj.description;
                    me.imagedata.created_at = convertedDate;
                })
                .catch(err => {
                    this.$emit('newid', me.id);
                    console.log(err);
                });

            axios
                .post('/comments', id2)
                .then(function(resp) {
                    console.log('resp from POST /comments', resp);
                    if (resp.data.obj != 0) {
                        me.comments = resp.data.obj;
                    }
                })
                .catch(err => console.log(err));
        },
        saveComment: function() {
            var me = this;

            if (
                this.usernameFromComment.trim().length == 0 ||
                this.comment.trim().length == 0
            ) {
                this.error = 'To post a comment fill username and comment';
                return;
            }
            this.error = '';

            const info = {
                id: this.id,
                usernameFromComment: this.usernameFromComment,
                comment: this.comment
            };
            axios
                .post('/saveComment', info)
                .then(function(resp) {
                    console.log('resp from POST /saveComment', resp);

                    me.comments = resp.data.obj;

                    //CSS transition when adding comment

                    gsap.from('.comment-transition', 0.5, {
                        y: 'random(40,60)',
                        stagger: 0.1
                    });

                    ////

                    me.usernameFromComment = '';
                    me.comment = '';
                })
                .catch(err => console.log(err));
        },
        closeModal: function() {
            this.$emit('close');
        },
        likeButtons: function(e) {
            e.stopPropagation();
            console.log('idWhenClicked', this.id);

            var me = this;
            axios.get(`/seeLikes/${this.id}`).then(res => {
                console.log('Response from seeLikes', res);

                let userUpdateLiked = {
                    liked: 'yes',
                    disliked: null,
                    imageID: me.id
                };

                let userUpdatedisLiked = {
                    liked: null,
                    disliked: 'yes',
                    imageID: me.id
                };

                let userData = res.data.response[0];

                console.log(
                    'liked',
                    userData.liked,
                    'dislike',
                    userData.dislike
                );
                if (e.target.attributes[2].nodeValue == 'like-button') {
                    if (userData.liked == null && userData.dislike != null) {
                        me.like++;
                        console.log('entered here');
                        axios
                            .post('/updateLikeFromUser', userUpdateLiked)
                            .then(() => {});
                        if (me.dislike != 0) {
                            me.dislike--;
                        }
                        return;
                    } else if (
                        userData.liked == null &&
                        userData.dislike == null
                    ) {
                        me.like++;
                        axios
                            .post('/updateLikeFromUser', userUpdateLiked)
                            .then(() => {});
                        return;
                    } else if (
                        userData.dislike == null &&
                        userData.liked != null
                    ) {
                        console.log('entered last part the likes button');
                        return;
                    }
                }

                if (e.target.attributes[2].nodeValue == 'dislike-button') {
                    if (userData.dislike == null && userData.like !== null) {
                        me.dislike++;
                        console.log('check like', me.like);
                        if (me.like != 0) {
                            me.like--;
                        }
                        axios
                            .post('/updateLikeFromUser', userUpdatedisLiked)
                            .then(() => {});

                        return;
                    } else if (
                        userData.dislike == null &&
                        userData.liked == null
                    ) {
                        me.dislike++;
                        axios
                            .post('/updateLikeFromUser', userUpdatedisLiked)
                            .then(() => {});
                        return;
                    } else if (
                        userData.dislike == null &&
                        userData.liked != null
                    ) {
                        return;
                    }
                }
            });
        },
        likeDataCheck: function() {
            var me = this;
            axios.get(`/likesTable/${this.id}`).then(res => {
                console.log('modalLikesTable', res);

                if (res.data.length == 0) {
                    me.like = 0;
                    me.dislike = 0;
                }
                if (res.data.length > 0) {
                    let likeCheck = 0;
                    let dislikeCheck = 0;
                    res.data.forEach(element => {
                        if (element.liked == 'yes') {
                            likeCheck++;
                        }
                        if (element.dislike == 'yes') {
                            dislikeCheck++;
                        }
                    });

                    me.like = likeCheck;
                    me.dislike = dislikeCheck;
                }
            });
        },
        deleteImg: function() {
            var me = this;
            console.log('Delete', this.imagedata.url);
            let url2 = { url: this.imagedata.url };
            axios
                .post('/deleteImg2', url2)
                .then(response => {
                    console.log(response);
                    me.$emit('closedelete');
                })
                .catch(err => console.log(err));
        }
    }
});

new Vue({
    el: '#main',
    data: {
        images: [],
        urls: [],
        title: '',
        description: '',
        username: '',
        file: null,
        id: location.hash.slice(1),
        addButton: null,
        offsetleft: null,
        offsettop: null,
        error: '',
        comments: []
    }, //data ends
    mounted: function() {
        console.log('the Vue component has mounted!', this.id);

        //Animating the beans

        gsap.registerPlugin(MotionPathPlugin);

        // const flightPath = {
        //     curviness: 2,
        //     autoRotate: false,
        //     path: [
        //         { x: 100, y: -20, scale:2 },
        //         { x: 200, y: 0 ,scale:1.7},
        //         { x: 300, y: 10, scale:1.5 },
        //         { x: 450, y: 130, scale:1.3 },
        //         { x: 700, y: 100,scale:1 }
        //     ]
        // };
        const flightPath = {
            curviness: 1.5,
            autoRotate: true,
            path: [
                { x: 100, y: -20, scale:2 },
                { x: 200, y: 0 ,scale:1.7},
                { x: 300, y: 10, scale:1.5 },
                { x: 450, y: 130, scale:1.3 },
                { x: 700, y: 100,scale:1 }
            ]
        };

        gsap.from('#beans', 1, {
            opacity: 0,
            x: -150,
            delay: 1,
        });
        gsap.to('#beans', 4, {
            delay: 1,
            motionPath: flightPath,
            ease: "sine.inOut"
        });

        const flightPath2 = {
            curviness: 1.25,
            autoRotate: true,
            path: [
                { x: -100, y: -20,scale:2 },
                { x: -200, y: 0, scale:1.7 },
                { x: -250, y: 10,scale:1.5 },
                { x: -350, y: 120,scale:1.3 },
                { x: -610, y: 100,scale:1 }
            ]
        };

        gsap.from('#beans2', 1, {
            opacity: 0,
            x: 150,
            delay: 1,
        });

        gsap.to('#beans2', 4, {
            delay: 1,
            motionPath: flightPath2,
            ease:  "sine.inOut"
        });

        //
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

                gsap.from('#logo', 0.5, { opacity: 0, ease: 'power1.out' });
                timeline.from('#logo', 0.5, { scale: 0.3 });

                // gsap.to('.form', 1, { x: 400})
                timeline.from('.form', 0.5, {
                    y: 50,
                    opacity: 0,
                    stagger: {
                        amount: 0.5,
                        from: 'edges',
                        grid: 'auto',
                        ease: 'power3.inOut'
                    }
                });
                timeline.from(box, 1, {
                    // x: 'random(1500,1000)',
                    scale: 0.1,
                    stagger: {
                        amount: 0.3,
                        from: 'center',
                        grid: 'auto'
                    }
                    // ease: 'bounce.out'
                });
                // timeline.to(box, 5, { x: 0, scale: 1 })
            });

        addEventListener('hashchange', function() {
            me.id = location.hash.slice(1);
        });
    },
    watch: {
        urls: function() {
            this.urls.forEach(element => {
                console.log('checkArrayUrl', this.urls);

                setTimeout(function() {
                    let test = document.querySelector(`img[src='${element}']`);
                    console.log(test);
                    gsap.from(test, 1, { x: -1000 });
                }, 1);
            });
        }
    },
    methods: {
        refresh: function() {
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

                    // gsap.to('.form', 1, { x: 400})
                    gsap.from('.form', 0.5, {
                        y: 400,
                        stagger: {
                            amount: 0.3,
                            from: 'edges',
                            grid: 'auto',
                            ease: 'power3.inOut'
                        }
                    });
                    timeline.from(box, 1, {
                        // x: 'random(1500,1000)',
                        scale: 0.1,
                        stagger: {
                            amount: 1.5,
                            from: 'center',
                            grid: 'auto'
                        }
                        // ease: 'bounce.out'
                    });
                });
        },
        handleClick: function(e) {
            e.preventDefault();

            var me = this;

            console.log('clicked', this);

            //Check if all the input fields has been added filled
            console.log(
                'Before Error uploading',
                this.title.trim(),
                this.description.trim(),
                this.username.trim()
            );
            if (
                !this.title.trim() ||
                !this.description.trim() ||
                !this.username.trim()
            ) {
                return (this.error =
                    'Please fill all the information before uploading an image');
            }

            this.error = '';

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
                    console.log('Array despues de subida', me.images, me.id);
                    me.refresh();
                    me.username = '';
                    me.title = '';
                    me.description = '';
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
            if (this.id == '') {
                this.id = id;
                console.log('imagedclicked', this);
            }
        },
        closeModal: function() {
            console.log('clicked CloseModal');
            gsap.to('#modalShow', 0.5, {
                scale: 0,
                y: 300
            });
            // this.id = null;
            var me = this;
            setTimeout(function() {
                me.id = history.replaceState(null, null, ' ');
            }, 200);
        },
        closeModalFromDelete: function() {
            console.log('clicked CloseModalFromDelete');
            gsap.to('#modalShow', 0.5, {
                scale: 0,
                y: 300
            });

            // this.id = null;
            var me = this;
            setTimeout(function() {
                me.id = history.replaceState(null, null, ' ');

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

                        // gsap.to('.form', 1, { x: 400})
                        gsap.from('.form', 0.5, {
                            y: 400,
                            stagger: {
                                amount: 0.3,
                                from: 'edges',
                                grid: 'auto',
                                ease: 'power3.inOut'
                            }
                        });
                        timeline.from(box, 1, {
                            // x: 'random(1500,1000)',
                            scale: 0.1,
                            stagger: {
                                amount: 1.5,
                                from: 'center',
                                grid: 'auto'
                            }
                            // ease: 'bounce.out'
                        });
                        // timeline.to(box, 5, { x: 0, scale: 1 })
                    });
            }, 200);
        },
        elementInfo: function(e) {
            this.offsetleft = e.clientX;
            this.offsettop = e.clientY;

            // console.log("elementInfo",e);
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
                    console.log('addMoreImages', resp);

                    //this  makes a refresh to the array
                    me.urls = [];

                    resp.data.response.forEach(newImg => {
                        me.images.push(newImg);
                        me.urls.push(newImg.url);

                        resp.data.resp1.forEach(checkId => {
                            // console.group(el)
                            if (checkId.lowestId == newImg.id) {
                                me.addButton = null;
                            }
                        });
                    });
                })
                .catch(err => console.log(err));
        },
        checkIdIfExist: function() {
            // console.log('checkifExist', id);
            this.id = history.replaceState(null, null, ' ');
        },
        arrowClick: function(e) {
            console.log(e.target.attributes[2]);
            var me = this;
            var tl = new TimelineLite();

            // setTimeout(function)
            axios
                .get(`/imagesId`)
                .then(response => {
                    let lastNumber = response.data.sort(function(a, b) {
                        return b - a;
                    });

                    //check the id in the array
                    // tl.from('#modalShow', 1, {x:-1000})
                    let newId = '';
                    lastNumber.forEach((element, index) => {
                        if (element.id == me.id) {
                            newId = index;
                            return;
                        }
                    });
                    console.log(
                        'condition',
                        newId + 1,
                        me.id,
                        lastNumber[0].id,
                        lastNumber.length - 1
                    );

                    let finalId = '';
                    if (e.target.attributes[2].nodeValue == 'right') {
                        finalId = lastNumber[newId + 1].id;
                        tl.from('#modalShow', 0.5, { x: 1000 });
                    } else if (
                        e.target.attributes[2].nodeValue == 'arrow-left'
                    ) {
                        finalId = lastNumber[newId - 1].id;
                        tl.from('#modalShow', 0.5, { x: -1000 });
                    }

                    me.id = finalId;
                    location.hash = me.id;

                    console.log(response);
                })
                .catch(() => {
                    me.closeModal();
                    //  return;
                });
        }
    }
});
