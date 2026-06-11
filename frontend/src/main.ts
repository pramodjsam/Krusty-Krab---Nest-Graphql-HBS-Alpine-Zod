import Alpine from 'alpinejs';
import persist from '@alpinejs/persist';
import { categoryAdminPage } from './admin/category';
import { categoryAdminFormPage } from './admin/category/form';
import { notyNotification } from './shared/notification';
import { productAdminPage } from './admin/product';
import { productAdminFormPage } from './admin/product/form';
import { userAdminPage } from './admin/user';
import 'noty/lib/noty.css';
import 'noty/lib/themes/mint.css';
import { orderAdminPage } from './admin/order';
import { registerStores } from './store';
import { homePage } from './main/home';
import { loginPage } from './main/auth/login';
import { registerPage } from './main/auth/register';
import { profilePage } from './main/user/profile';
import { orderPage } from './main/user/order';
import { orderDetailsPage } from './main/user/order-details';

Alpine.plugin(persist);

registerStores();

(window as any).Alpine = Alpine;
Alpine.data('categoryAdminPage', categoryAdminPage);
Alpine.data('categoryAdminFormPage', categoryAdminFormPage);
Alpine.data('productAdminPage', productAdminPage);
Alpine.data('productAdminFormPage', productAdminFormPage);
Alpine.data('userAdminPage', userAdminPage);
Alpine.data('orderAdminPage', orderAdminPage);
Alpine.data('homePage', homePage);
Alpine.data('loginPage', loginPage);
Alpine.data('registerPage', registerPage);
Alpine.data('profilePage', profilePage);
Alpine.data('orderPage', orderPage);
Alpine.data('orderDetailsPage', orderDetailsPage);

(window as any).showNotification = notyNotification;

Alpine.start();
