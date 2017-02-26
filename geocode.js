ymaps.ready(function() {
var map,
	regionName = "",
	center = [56.226651, 58.009098],
	zoom = 12;
	map = new ymaps.Map('map', {
	center: center,
	zoom: zoom,
	controls: []
}),
        // Создадим собственный макет выпадающего списка.
        ListBoxLayout = ymaps.templateLayoutFactory.createClass(
            "<button id='my-listbox-header' class='btn btn-success dropdown-toggle' data-toggle='dropdown'>" +
                "{{data.title}} <span class='caret'></span>" +
            "</button>" +
            "<ul id='my-listbox'" +
                " class='dropdown-menu' role='menu' aria-labelledby='dropdownMenu'" +
                " style='display: {% if state.expanded %}block{% else %}none{% endif %};'></ul>", {

            build: function() {
                // Вызываем метод build родительского класса перед выполнением
                // дополнительных действий.
                ListBoxLayout.superclass.build.call(this);

                this.childContainerElement = $('#my-listbox').get(0);
                // Генерируем специальное событие, оповещающее элемент управления
                // о смене контейнера дочерних элементов.
                this.events.fire('childcontainerchange', {
                    newChildContainerElement: this.childContainerElement,
                    oldChildContainerElement: null
                });
            },

            // Переопределяем интерфейсный метод, возвращающий ссылку на
            // контейнер дочерних элементов.
            getChildContainerElement: function () {
                return this.childContainerElement;
            },

            clear: function () {
                this.events.fire('childcontainerchange', {
                    newChildContainerElement: null,
                    oldChildContainerElement: this.childContainerElement
                });
                this.childContainerElement = null;
                ListBoxLayout.superclass.clear.call(this);
            }
        }),

        // Также создадим макет для отдельного элемента списка.
        ListBoxItemLayout = ymaps.templateLayoutFactory.createClass(
            "<li><a>{{data.content}}</a></li>"
        ),
        listBoxItems = [
            new ymaps.control.ListBoxItem({
                data: {
                    content: 'Ленинский район',
                    regionName: "Пермский край, Ленинский район"
                }
            }),
            new ymaps.control.ListBoxItem({
                data: {
                    content: 'Дзержинский район',
                    regionName: "Пермский край, Дзержинский район"
                }
            }),
			new ymaps.control.ListBoxItem({
                data: {
                    content: 'Кировский район',
                    regionName: "Пермский край, Кировский район"
                }
            }),
			new ymaps.control.ListBoxItem({
                data: {
                    content: 'Орджоникидзевский район',
                    regionName: "Пермский край, Орджоникидзевский район"
                }
            }),
			new ymaps.control.ListBoxItem({
                data: {
                    content: 'Индустриальный район',
                    regionName: "Пермский край, Индустриальный район"
                }
            }),
			new ymaps.control.ListBoxItem({
                data: {
                    content: ' Мотовилихинский район',
                    regionName: "Пермский край, Мотовилихинский район"
                }
            }),
			new ymaps.control.ListBoxItem({
                data: {
                    content: ' Свердловский район',
                    regionName: "Пермский край, Свердловский район"
                }
            })
        ],
        listBox = new ymaps.control.ListBox({
                items: listBoxItems,
                data: {
                    title: 'Выберите район'
                },
                options: {
                    layout: ListBoxLayout,
                    itemLayout: ListBoxItemLayout
                }
            });

        listBox.events.add('click', function (e) {
            var item = e.get('target');
            if (item != listBox) {
				var url = "https://nominatim.openstreetmap.org/search";
				var jsondata = $.getJSON(url, {
						q: item.data.get('regionName'),
						format: "json",
						polygon_geojson: 1
					})
				.then(function(data) {
				$.each(data, function(ix, place) {
				map.geoObjects.each(function(context) {
					map.geoObjects.remove(context);
				});
				if ("MultiPolygon" == place.geojson.type) {
					place.geojson.coordinates.forEach(function(coords) {
					var feat = {
						'type': 'Polygon',
						'coordinates': coords
					};
					var p = new ymaps.Polygon(feat.coordinates, {
							hintContent: regionName
						}, {
							fillColor: '#6699ff',
							interactivityModel: 'default#transparent',
							strokeWidth: 2,
							opacity: 0.3
							});
						//Добавляем полигоны на карту
						map.geoObjects.add(p);
						map.setBounds(map.geoObjects.getBounds())
					});
					} else if ("relation" == place.osm_type) {
						var p = new ymaps.Polygon(place.geojson.coordinates, {
						hintContent: regionName
					}, {
						fillColor: '#6699ff',
						interactivityModel: 'default#transparent',
						strokeWidth: 2,
						opacity: 0.3
					});
						// Добавляем полигон на карту
						map.geoObjects.add(p);
						map.setBounds(map.geoObjects.getBounds())
						}
					});
					}, function(err) {
						console.log(err);
					});
            }
        });

    map.controls.add(listBox, {float: 'left'});
});