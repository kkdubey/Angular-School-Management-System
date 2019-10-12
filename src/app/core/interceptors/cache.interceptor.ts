import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { HttpCacheService } from '../services/http-cache/http-cache.service';
import { Config } from 'src/app/config/app.config';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
    constructor(private cacheService: HttpCacheService, private config: Config) { }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const cachedResponse: HttpResponse<any> = this.cacheService.get(req.url);
        const cachableUrl: string[] = [
            `${this.config.apiUrl}/api/genders/all`,
            `${this.config.apiUrl}/api/religions/all`,
            `${this.config.apiUrl}/api/phones/allowed-countries`
        ];
        if (req.method === 'GET' && cachableUrl.includes(req.url)) {
            if (cachedResponse) {
                return of(cachedResponse);
            }
            return next.handle(req)
                .pipe(tap(event => {
                    if (event instanceof HttpResponse) {
                        this.cacheService.put(req.url, event);
                    }
                }));
        }
        return next.handle(req);
    }
}