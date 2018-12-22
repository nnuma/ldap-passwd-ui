const passwordRegex = /^(?=.*?[a-z])(?=.*?\d)(?=.*?[ !-\/:-@[-`{-~])[ !-~]{8,}$/i;
const request = window.superagent;
// IE はサポート対象外
const ua = navigator.userAgent.toLowerCase();
var isIE = (ua.indexOf('msie') > -1) || (ua.indexOf('trident/7') > -1);
if (isIE) {
  alert('IE はサポートしていません。Chrome や Safari または スマートフォンで変更してください。')
}

new Vue({
  el: '#app',
  data() {
    const checkStrongPassword = (rule, value, callback) => {
      if (!value.match(passwordRegex)) {
        this.okNew = false;
        callback(new Error('半角英字、半角数字、記号を組み合わせ、8文字以上で設定してください。'));
      } else if (value === this.userForm.password) {
        this.okNew = false;
        callback(new Error('現在のパスワードと同じパスワードは使用できません。'));
      } else {
        this.okNew = true;
        callback();
      }
    }
    const checkNewPassword = (rule, value, callback) => {
      if (this.userForm.newPassword !== value) {
        this.okNewConfirm = false;
        callback(new Error('新しいパスワード（確認）を正しく入力してください。'));
      } else {
        this.okNewConfirm = true;
        callback();
      }
    }
    return {
      loading: false,
      okNew: false,
      okNewConfirm: false,
      userForm: {
        id: '',
        password: '',
        newPassword: '',
        newPasswordConfirm: '',
      },
      rules: {
        id: [
          { required: true, message: '必須項目です。', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '必須項目です。', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '必須項目です。', trigger: 'blur' },
          { validator: checkStrongPassword, trigger: 'blur' }
        ],
        newPasswordConfirm: [
          { required: true, message: '必須項目です。', trigger: 'blur' },
          { validator: checkNewPassword, trigger: 'blur' }
        ],
      }
    }
  },
  computed: {
    submittable() {
      return this.userForm.id !== ''
        && this.userForm.password !== ''
        && this.userForm.newPassword != ''
        && this.userForm.newPasswordConfirm != ''
        && this.okNew && this.okNewConfirm;
    }
  },
  methods: {
    resetForm() {
      this.userForm.password = '';
      this.userForm.newPassword = '';
      this.userForm.newPasswordConfirm = '';
    },
    submitForm(callback) {
      this.loading = true;
      request
        .post('/api/change')
        .set('X-XSRF-TOKEN', docCookies.getItem('_csrf'))
        .send(this.userForm)
        .end(function(err, res) {
          callback(res.statusCode);
        });
    },
    showConfirm() {
      this.$confirm('パスワードを変更します。<br/>本当によろしいですか？', '確認', {
        confirmButtonText: 'OK',
        cancelButtonText: 'キャンセル',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(() => {
        this.submitForm((statusCode) => {
          var t = '';
          var m = '';
          switch (statusCode) {
            case 200:
              t = 'success';
              m = 'パスワードを変更しました。';
              break;
            case 400:
              t = 'warning';
              m = 'ユーザ名かパスワードが違います。';
              break;
            default:
              t = 'error';
              m = 'サーバエラーが発生しました。何度も発生する場合は管理者に問い合わせてください。';
              break;
          }
          this.$message({
            type: t,
            message: m
          });
          this.loading = false;
        });
      }).catch(() => {
        console.log('canceled.');
      });
    }
  }
});
