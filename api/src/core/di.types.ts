export const TYPES = {
    // Repositories
    UsersRepository: Symbol.for("UsersRepository"),
    RoomsRepository: Symbol.for("RoomsRepository"),
    NotesRepository: Symbol.for("NotesRepository"),
    ApiTokensRepository: Symbol.for("ApiTokensRepository"),
    ImagesRepository: Symbol.for("ImagesRepository"),

    // Services
    RoomsService: Symbol.for("RoomsService"),
    AuthService: Symbol.for("AuthService"),
    NotesService: Symbol.for("NotesService"),
    ApiTokensService: Symbol.for("ApiTokensService"),
    ImagesService: Symbol.for("ImagesService"),
    WebSocketService: Symbol.for("WebSocketService"),

    // Controllers (Plugins)
    RoomsController: Symbol.for("RoomsController"),
    NotesController: Symbol.for("NotesController"),
    ApiTokensController: Symbol.for("ApiTokensController"),
    ImagesController: Symbol.for("ImagesController"),
    WebSocketController: Symbol.for("WebSocketController"),

    // Other
    Db: Symbol.for("Db"),
  };
