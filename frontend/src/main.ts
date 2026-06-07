import Alpine from 'alpinejs';
import { categoryAdminPage } from './admin/category';
import { categoryAdminFormPage } from './admin/category/form';
import { notyNotification } from './shared/notification';
import { productAdminPage } from './admin/product';
import { productAdminFormPage } from './admin/product/form';
import { userAdminPage } from './admin/user';
import 'noty/lib/noty.css';
import 'noty/lib/themes/mint.css';
import { orderAdminPage } from './admin/order';

(window as any).Alpine = Alpine;
Alpine.data('categoryAdminPage', categoryAdminPage);
Alpine.data('categoryAdminFormPage', categoryAdminFormPage);
Alpine.data('productAdminPage', productAdminPage);
Alpine.data('productAdminFormPage', productAdminFormPage);
Alpine.data('userAdminPage', userAdminPage);
Alpine.data('orderAdminPage', orderAdminPage);

(window as any).showNotification = notyNotification;

Alpine.start();
