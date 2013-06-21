/* Use this script if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'icomoon\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-untitled' : '&#x21;',
			'icon-untitled-2' : '&#x41;',
			'icon-untitled-3' : '&#x64;',
			'icon-untitled-4' : '&#x42;',
			'icon-untitled-5' : '&#x48;',
			'icon-untitled-6' : '&#x53;',
			'icon-untitled-7' : '&#x61;',
			'icon-untitled-8' : '&#x65;',
			'icon-untitled-9' : '&#x6c;',
			'icon-untitled-10' : '&#x6f;',
			'icon-untitled-11' : '&#x73;',
			'icon-untitled-12' : '&#x74;',
			'icon-untitled-13' : '&#x75;',
			'icon-embed' : '&#x63;',
			'icon-snowflake' : '&#x6e;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, html, c, el;
	for (i = 0; i < els.length; i += 1) {
		el = els[i];
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c) {
			addIcon(el, icons[c[0]]);
		}
	}
};