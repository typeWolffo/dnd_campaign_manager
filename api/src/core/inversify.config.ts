import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './di.types';
import { db } from '../db/connection';
import { AuthService } from '../modules/auth/auth.service';
import { RoomsRepository } from '../modules/rooms/rooms.repository';
import { RoomsService } from '../modules/rooms/rooms.service';
import { createRoomsController } from '../modules/rooms/rooms.controller';
import { NotesRepository } from '../modules/notes/notes.repository';
import { NotesService } from '../modules/notes/notes.service';
import { createNotesController } from '../modules/notes/notes.controller';
import { ApiTokensRepository } from '../modules/api-tokens/api-tokens.repository';
import { ApiTokensService } from '../modules/api-tokens/api-tokens.service';
import { createApiTokensController } from '../modules/api-tokens/api-tokens.controller';
import { ImagesRepository } from '../modules/images/images.repository';
import { ImagesService } from '../modules/images/images.service';
import { createImagesController } from '../modules/images/images.controller';
import { WebSocketService } from '../modules/websocket/websocket.service';
import { createWebSocketController } from '../modules/websocket/websocket.controller';

const container = new Container();

// Database
container.bind(TYPES.Db).toConstantValue(db);

// Services
container.bind<AuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();
container.bind<RoomsService>(TYPES.RoomsService).to(RoomsService).inSingletonScope();
container.bind<NotesService>(TYPES.NotesService).to(NotesService).inSingletonScope();
container.bind<ApiTokensService>(TYPES.ApiTokensService).to(ApiTokensService).inSingletonScope();
container.bind<ImagesService>(TYPES.ImagesService).to(ImagesService).inSingletonScope();
container.bind<WebSocketService>(TYPES.WebSocketService).to(WebSocketService).inSingletonScope();

// Repositories
container.bind<RoomsRepository>(TYPES.RoomsRepository).to(RoomsRepository).inSingletonScope();
container.bind<NotesRepository>(TYPES.NotesRepository).to(NotesRepository).inSingletonScope();
container.bind<ApiTokensRepository>(TYPES.ApiTokensRepository).to(ApiTokensRepository).inSingletonScope();
container.bind<ImagesRepository>(TYPES.ImagesRepository).to(ImagesRepository).inSingletonScope();

// Controllers (Elysia plugins) - factory function to create controller instances
container.bind<() => ReturnType<typeof createRoomsController>>(TYPES.RoomsController).toFactory(() => {
  return () => {
    const roomsService = container.get<RoomsService>(TYPES.RoomsService);
    const authService = container.get<AuthService>(TYPES.AuthService);
    return createRoomsController(roomsService, authService);
  };
});

container.bind<() => ReturnType<typeof createNotesController>>(TYPES.NotesController).toFactory(() => {
  return () => {
    const notesService = container.get<NotesService>(TYPES.NotesService);
    const authService = container.get<AuthService>(TYPES.AuthService);
    return createNotesController(notesService, authService);
  };
});

container.bind<() => ReturnType<typeof createApiTokensController>>(TYPES.ApiTokensController).toFactory(() => {
  return () => {
    const apiTokensService = container.get<ApiTokensService>(TYPES.ApiTokensService);
    const authService = container.get<AuthService>(TYPES.AuthService);
    return createApiTokensController(apiTokensService, authService);
  };
});

container.bind<() => ReturnType<typeof createImagesController>>(TYPES.ImagesController).toFactory(() => {
  return () => {
    const imagesService = container.get<ImagesService>(TYPES.ImagesService);
    const authService = container.get<AuthService>(TYPES.AuthService);
    return createImagesController(imagesService, authService);
  };
});

container.bind<() => ReturnType<typeof createWebSocketController>>(TYPES.WebSocketController).toFactory(() => {
  return () => {
    const webSocketService = container.get<WebSocketService>(TYPES.WebSocketService);
    return createWebSocketController(webSocketService);
  };
});

export { container };
