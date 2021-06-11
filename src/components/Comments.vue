<template>
    <div class="comments">
        <div :class="comments_wrapper_classes">
            <single-comment 
                v-for="comment in comments"
                :comment="comment"
                :language="language"
                :key="comment.id"
            ></single-comment>
        </div>
        <hr v-if="!isreadonly">
        <div v-if="!isreadonly" class="reply">
            <input
                type="text" 
                v-model.trim="reply" 
                class="reply--text" 
                :placeholder="$t('repository.screen.comment.placeholder')"
                maxlength="250"
                :disabled="disabled"
                @keyup.enter="submitComment"
            />
        </div>
        <div v-if="!isreadonly" class="pt-2 pl-1" >
            <v-btn color="info" @click.prevent="submitComment" :disabled="disabled || reply == ''">{{ $t('button.save') }}</v-btn>
        </div>
    </div>
</template>

<script>
// https://github.com/tsanak/comments
import singleComment from './SingleComment'
    export default {
        name: 'comments',
        components: {
            singleComment
        },
        data() {
            return {
                reply: ''
            }
        },
        methods: {
            submitComment() {
                if(this.reply != '') {
                    this.$emit('submit-comment', this.requirementCode, this.comments, this.reply);
                    this.reply = '';
                }
            }
        },
        created() {
            this.$i18n.locale = this.$store.getters.getLanguage;
        },
        props: ['comments', 'requirementCode', 'comments_wrapper_classes', 'isreadonly', 'disabled', 'language']
    }
</script>

<style scoped>
.comments {
    margin-top: 20px;
    padding: 20px;
    padding-top: 0;
}

.comments-wrapper {
    max-height: 250px;
    overflow-y: auto;
    padding-right: 10px;
}

.custom-scrollbar::-webkit-scrollbar-track
{
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
    -moz-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
    box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
    border-radius: 10px;
    background-color: #fff;
}

.custom-scrollbar::-webkit-scrollbar
{
    width: 8px;
    background-color: #fff;
}

.custom-scrollbar::-webkit-scrollbar-thumb
{
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
    -moz-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
    box-shadow: inset 0 0 6px rgba(0,0,0,.3);
    background-color: #555;
}

/* Reply component */
.reply {
    display: flex;
    position: relative;
    align-items: center;
    background-color: #EBEBEB;
    border-radius: 30px;
    padding: 5px 10px;
    overflow: hidden;
}

.reply .avatar {
    position: absolute;
}

.reply .avatar > img {
    width: 40px;
    height: 40px;
    border-radius: 100%;
}

.reply .reply--text {
    min-height: 40px;
    padding: 10px 10px 10px 10px;
    margin-right: 10px;
    border: 0;
    color: #333;
    width: 100%;
    outline: 0;
    background-color: transparent;
    box-shadow: none;
}

.reply input.reply--text:valid {
    margin-right: 71px;
}

.reply input.reply--text:valid + .reply--button {
    right: 10px;
}

hr {
    margin-top: 10px;
    margin-bottom: 10px;
}
</style>
