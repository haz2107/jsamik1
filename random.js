(function() {
    if (!window.Lampa) {
        console.error('Ошибка: Lampa не найдена');
        return;
    }

    // Ваш API-ключ TMDb (нужно зарегистрироваться на https://www.themoviedb.org/ и получить ключ)
    const API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c'; // Пример ключа (замените на свой для реальной работы)
    const API_URL = 'https://api.themoviedb.org/3';

    // Функция добавления пункта в меню
    function addMenuItem() {
        Lampa.Menu.add({
            id: 'random_movie',
            title: 'Случайное кино',
            icon: 'casino',
            action: function() {
                showRandomMovie();
            }
        });
    }

    // Функция получения случайного фильма
    function getRandomMovie(callback) {
        // Получаем популярные фильмы (страница случайная)
        const randomPage = Math.floor(Math.random() * 100) + 1; // TMDb позволяет до 500 страниц, но ограничим 100
        fetch(`${API_URL}/movie/popular?api_key=${API_KEY}&language=ru-RU&page=${randomPage}`)
            .then(response => response.json())
            .then(data => {
                const movies = data.results;
                const randomIndex = Math.floor(Math.random() * movies.length);
                const movie = movies[randomIndex];
                callback({
                    title: movie.title,
                    year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
                    poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                    overview: movie.overview || 'Описание отсутствует',
                    id: movie.id
                });
            })
            .catch(error => {
                console.error('Ошибка загрузки фильма:', error);
                callback(null);
            });
    }

    // Функция отображения случайного фильма
    function showRandomMovie() {
        const component = new Lampa.Component({
            name: 'random_movie',
            html: `
                <div class="random-movie-container">
                    <div class="random-movie-poster"></div>
                    <div class="random-movie-info">
                        <h2 class="random-movie-title"></h2>
                        <p class="random-movie-year"></p>
                        <p class="random-movie-overview"></p>
                        <button class="random-movie-button">Обновить</button>
                    </div>
                </div>
            `,
            onRender: function(element) {
                const poster = element.find('.random-movie-poster');
                const title = element.find('.random-movie-title');
                const year = element.find('.random-movie-year');
                const overview = element.find('.random-movie-overview');
                const button = element.find('.random-movie-button');

                // Загружаем фильм
                function loadMovie() {
                    getRandomMovie(function(movie) {
                        if (movie) {
                            poster.html(`<img src="${movie.poster}" style="max-width: 200px;">`);
                            title.text(movie.title);
                            year.text(`Год: ${movie.year}`);
                            overview.text(movie.overview);

                            // Переход на страницу фильма при клике на постер
                            poster.on('hover:enter', function() {
                                Lampa.Activity.push({
                                    url: '',
                                    title: movie.title,
                                    component: 'full',
                                    id: movie.id,
                                    source: 'tmdb'
                                });
                            });
                        } else {
                            title.text('Ошибка загрузки');
                            overview.text('Не удалось загрузить фильм. Попробуйте снова.');
                        }
                    });
                }

                // Первая загрузка
                loadMovie();

                // Обновление фильма по кнопке
                button.on('click', function() {
                    loadMovie();
                });
            }
        });

        // Добавляем стили
        Lampa.Template.css('random_movie_style', `
            .random-movie-container { display: flex; padding: 20px; }
            .random-movie-poster { margin-right: 20px; }
            .random-movie-info { flex: 1; }
            .random-movie-title { font-size: 24px; margin: 0; }
            .random-movie-year { color: #aaa; }
            .random-movie-overview { font-size: 16px; }
            .random-movie-button { 
                padding: 10px 20px; 
                background: #f44336; 
                color: white; 
                border: none; 
                cursor: pointer; 
                margin-top: 10px; 
            }
            .random-movie-button:hover { background: #d32f2f; }
        `);

        // Отображаем компонент
        Lampa.Activity.push({
            url: '',
            title: 'Случайное кино',
            component: component.name,
            page: 1
        });
    }

    // Инициализация плагина
    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
            addMenuItem();
        }
    });
})();