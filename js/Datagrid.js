jQuery(function () {

	var Datagrid = {
		selector: 'div.grid',
	};

	Datagrid.shouldListen = function (settings) {
		if (!settings.nette) {
			return false;
		}

		var el = settings.nette.el[0];

		if (!el) {
			return false;
		}

		var isGridLink = false;

		jQuery(this.selector).each(function () {
			if (this.contains(el)) {
				isGridLink = true;

				return false;
			}
		});

		return isGridLink;
	};

	Datagrid.before = function (xhr, settings) {
		if (Datagrid.shouldListen(settings)) {
			var url = Datagrid.processUrl(settings.url);

			if (!url) {
				return;
			}

			history.pushState({url: url}, null, url);
		}
	};

	Datagrid.init = function () {
		window.addEventListener('popstate', function (e) {
			e.preventDefault();
			var state = e.state;

			if (state !== null && history.state && history.state.url) {
				$.nette.ajax({
					url: history.state.url,
					off: ['fapi.datagrid']
				});
			} else if (e.target instanceof Window && e.target.location) {
				window.location.href = e.target.location.href;
			}

			return false;
		});
	};

	Datagrid.processUrl = function getAllUrlParams(url) {
		var params = this.getAllUrlParams(url);
		var urlPart = url.split('?')[0];
		var query = '?';

		for (var key in params) {
			if (!params.hasOwnProperty(key)) {
				continue;
			}

			var value = params[key];

			if (key === '') {
				continue;
			}

			if (key === 'actions[action]') {
				continue;
			}

			if (key === 'actions[process]') {
				continue;
			}

			if (key === 'actions[items]') {
				return null;
			}

			if (params[key] === '') {
				continue;
			}

			if (key === 'do' && !(
				value.endsWith('form-submit')
				|| value.endsWith('paginate')
				|| value.endsWith('sort')
				|| value.endsWith('edit')
			)) {
				return null;
			}

			query += encodeURIComponent(key) + '=' + params[key] + '&';
		}

		if (query.endsWith('&')) {
			query = query.substring(0, query.length - 1);
		}

		return urlPart + query;
	};

	Datagrid.getAllUrlParams = function (url) {
		var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

		var obj = {};

		if (queryString) {
			queryString = queryString.split('#')[0];

			var arr = queryString.split('&');

			for (var i = 0; i < arr.length; i++) {
				var a = arr[i].split('=');

				var paramName = decodeURIComponent(a[0]);
				var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

				if (paramName.match(/\[(\d+)?\]$/)) {

					var key = paramName.replace(/\[(\d+)?\]/, '');
					if (!obj[key]) obj[key] = [];

					if (paramName.match(/\[\d+\]$/)) {
						var index = /\[(\d+)\]/.exec(paramName)[1];
						obj[key][index] = paramValue;
					} else {
						obj[key].push(paramValue);
					}
				} else {
					if (!obj[paramName]) {
						obj[paramName] = paramValue;
					} else if (obj[paramName] && typeof obj[paramName] === 'string') {
						obj[paramName] = [obj[paramName]];
						obj[paramName].push(paramValue);
					} else {
						obj[paramName].push(paramValue);
					}
				}
			}
		}

		return obj;
	};

	$.nette.ext('fapi.datagrid', {
		init: Datagrid.init(),
		before: Datagrid.before
	});

});
