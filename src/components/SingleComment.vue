<template>
    <div class="comment">
        <div class="text">
            <div>
            <a class="username" href="#">@{{ comment.userName }}</a>  <span>{{ comment.text }}</span>
            </div>
            <div>
                <span class="caption font-weight-thin">{{ formatDate(comment.creationDate) }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import moment from 'moment';
export default {
    name: 'singleComment',
    props: ['comment','language'],
    methods: {
        formatDate (date) {
            if(date) {
                let localizedDate = moment(date).locale(this.language)
                return localizedDate.format('DD MMM YYYY HH:mm')
            } else {
                return ''
            }
        },
    }
}
</script>

<style scoped>
/* Single-comment component */
.comment {
    display: flex;
    padding: 10px;
    margin-bottom: 10px;
    align-items: center;
    color: #333;
    background-color: #F2F2F2;
    border-radius: 30px;
    box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}

.comment .avatar {
    align-self: flex-start;
}

.comment .avatar > img {
    width: 40px;
    height: 40px;
    border-radius: 100%;
    align-self: start;
}

.comment .text {
    text-align: left;
    margin-left: 5px;
}

.comment .text span {
    margin-left: 5px;
}

.comment .text .username {
    font-weight: bold;
    color: #333;
}

</style>
