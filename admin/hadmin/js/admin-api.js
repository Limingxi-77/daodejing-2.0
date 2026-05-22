(function (global) {
    'use strict';

    var TOKEN_KEY = 'hadmin_token';
    var ADMIN_KEY = 'hadmin_admin';
    var LOGIN_PAGE = 'login.html';

    function getToken() {
        try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; }
    }

    function getAdmin() {
        try {
            var raw = localStorage.getItem(ADMIN_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

    function clearAuth() {
        try {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(ADMIN_KEY);
        } catch (e) {}
    }

    function redirectToLogin() {
        var path = location.pathname || '';
        var isChildIframe = window.top !== window.self;
        var target = LOGIN_PAGE;
        if (isChildIframe) {
            window.top.location.replace(target);
        } else {
            location.replace(target);
        }
    }

    function requireAuth() {
        if (!getToken()) {
            redirectToLogin();
            return false;
        }
        return true;
    }

    function logout() {
        clearAuth();
        redirectToLogin();
    }

    function qs(obj) {
        if (!obj) return '';
        var parts = [];
        Object.keys(obj).forEach(function (k) {
            var v = obj[k];
            if (v === undefined || v === null || v === '') return;
            parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
        });
        return parts.join('&');
    }

    function apiFetch(path, options) {
        options = options || {};
        var headers = Object.assign(
            { 'Content-Type': 'application/json' },
            options.headers || {}
        );
        var token = getToken();
        if (token) headers['Authorization'] = 'Bearer ' + token;

        var url = path;
        return fetch(url, {
            method: options.method || 'GET',
            headers: headers,
            body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined
        }).then(function (response) {
            var contentType = response.headers.get('content-type') || '';
            var parser = contentType.indexOf('application/json') >= 0
                ? response.json().catch(function () { return {}; })
                : response.text().then(function (t) { return { message: t }; });
            return parser.then(function (data) {
                if (response.status === 401 || response.status === 403) {
                    clearAuth();
                    redirectToLogin();
                    var err401 = new Error((data && data.message) || '登录已失效，请重新登录');
                    err401.status = response.status;
                    throw err401;
                }
                if (!response.ok) {
                    var err = new Error((data && data.message) || ('请求失败 ' + response.status));
                    err.status = response.status;
                    err.code = data && data.code;
                    err.data = data;
                    throw err;
                }
                return data;
            });
        });
    }

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function formatDate(iso, withTime) {
        if (!iso) return '-';
        var d = new Date(iso);
        if (isNaN(d.getTime())) return String(iso);
        var s = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
        if (withTime !== false) {
            s += ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
        }
        return s;
    }

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function renderPagination(containerSelector, pagination, onChange) {
        var $box = (typeof jQuery !== 'undefined') ? jQuery(containerSelector) : null;
        if (!$box || !$box.length || !pagination) return;
        var total = Number(pagination.total || 0);
        var page = Number(pagination.page || 1);
        var pageSize = Number(pagination.pageSize || 20);
        var maxPage = Math.max(Math.ceil(total / pageSize), 1);
        var html = '<ul class="pagination" style="margin: 10px 0;">';
        function item(label, p, disabled, active) {
            var cls = (disabled ? 'disabled ' : '') + (active ? 'active' : '');
            return '<li class="' + cls.trim() + '"><a href="javascript:void(0)" data-page="' + p + '">' + label + '</a></li>';
        }
        html += item('上一页', Math.max(1, page - 1), page <= 1, false);
        var start = Math.max(1, page - 2);
        var end = Math.min(maxPage, start + 4);
        if (end - start < 4) start = Math.max(1, end - 4);
        for (var p = start; p <= end; p++) {
            html += item(String(p), p, false, p === page);
        }
        html += item('下一页', Math.min(maxPage, page + 1), page >= maxPage, false);
        html += '</ul>';
        html += '<div class="text-muted" style="display:inline-block;margin-left:10px;">共 ' + total + ' 条 / 第 ' + page + ' / ' + maxPage + ' 页</div>';
        $box.html(html);
        $box.off('click.pager').on('click.pager', 'a[data-page]', function () {
            var p = Number(jQuery(this).data('page')) || 1;
            if (p === page) return;
            if (typeof onChange === 'function') onChange(p);
        });
    }

    function showError(containerSelector, message) {
        var box = document.querySelector(containerSelector);
        if (!box) return;
        if (!message) {
            box.style.display = 'none';
            box.textContent = '';
            return;
        }
        box.textContent = message;
        box.style.display = 'block';
    }

    function notify(message, type) {
        if (typeof layer !== 'undefined' && layer.msg) {
            var icon = type === 'error' ? 2 : (type === 'success' ? 1 : 0);
            layer.msg(message, { icon: icon, time: 2000 });
        } else if (typeof alert === 'function') {
            alert(message);
        }
    }

    function confirmAction(message) {
        return new Promise(function (resolve) {
            if (typeof layer !== 'undefined' && layer.confirm) {
                layer.confirm(message, { btn: ['确定', '取消'] },
                    function (idx) { layer.close(idx); resolve(true); },
                    function () { resolve(false); }
                );
            } else {
                resolve(window.confirm(message));
            }
        });
    }

    global.AdminAPI = {
        getToken: getToken,
        getAdmin: getAdmin,
        requireAuth: requireAuth,
        logout: logout,
        apiFetch: apiFetch,
        qs: qs,
        formatDate: formatDate,
        escapeHtml: escapeHtml,
        renderPagination: renderPagination,
        showError: showError,
        notify: notify,
        confirmAction: confirmAction
    };
})(window);
